//*******
//** Config
//*******
var config = require('./config').Config;
//*******

//*******
//** Utils
//*******
var utils = require('./utils').Utils;
//*******

//*******
//** Class
//*******
var Game                = require('./game/game').Game;
var Character           = require('./character/character').Character;
var Bot                 = require('./character/bot').Bot;
var Player              = require('./character/player').Player;
var Map                 = require('./map/map').Map;
var Pillar              = require('./map/pillar').Pillar;
var Director            = require('./decision/director').Director;
var Decision            = require('./decision/decision').Decision;

var game                = new Game(config.GameStates, config.Games);
var playerStack         = {};
//*******

// Handler
function handler (req, res) {
    fs.readFile(__dirname + '/client/index.html',
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}

// Servers initialisation
var http    = require('http').createServer(handler);
var socket  = require('socket.io');
var fs      = require('fs');

// Server listening
var app = http.listen(config.port, config.host);
var io  = socket.listen(app);
console.log('Server running at http://'+config.host+':'+config.port+'/');

// On client connection, check game state and connect him
io.sockets.on('connection', function(socket) {
    // Debug event
    if( config.debug ) {
        // This event will send an event back defined by data's first element
        // Data's second element will be send as data into back event
        socket.on('debug.ask', function(data) {
            socket.emit(data[0], data[1]);
        });        
    }

    initPlayer(socket);

    // On client disconnection
    socket.on('disconnect', function() {
        // Kill player if always in stack
        if( socket.id in playerStack ) {
            //Get player to disconnect
            currentPlayer = playerStack[socket.id];

            console.log('Disconnect player "'+ currentPlayer.character.id +'" (socket "'+ socket.id +'")');
            
            // If game is started, kill player
            if( game.state >= config.GameStates.READY ) {
                currentPlayer.character.isDead();
                // TODO : stop game if just one player left
                console.log('player killed');
            }
            // Else, just remove player from stack to free place for another one 
            else {
                game.removePlayer(currentPlayer);
                delete playerStack[socket.id];
                console.log('player disconnected');
            }
        } else {
            console.log('socket "'+ socket.io +'" not correspond to a connected player');
        }
    });

    // Reset game
    socket.on('game.reset', function() {
        game.stop();
        game = new Game(config.GameStates, config.Games);
        initPlayer(socket);
    });
});


function initPlayer(socket) {
    // Check if player can join the game
    var currentPlayer = new Player(new Character(), socket.id);
    // Is there slot to add client as player, or viewer
    var isPlayer = game.addPlayer(currentPlayer);

    // No more free slot
    if( !isPlayer ) {
        socket.emit('game.cannot_join')
    }
    // Player will play
    else {
        // Add player in the handle stack
        playerStack[socket.id] = currentPlayer;
        console.log('Connect player "'+ playerStack[socket.id].character.id +'" (socket "'+ socket.id +'")');

        // Player can do actions
        socket.on('player.action', function(data) { 
            game.notifyPlayerAction(currentPlayer, data);
        });
    }

    // Send game initialization for current client
    sendGameInit(socket, isPlayer ? currentPlayer : undefined);
}

/**
 *  Send init game state for a player
 */
function sendGameInit(socket, player)
{
    // Send initial map state
    var pillars = [];
    for(var i = 0; i < game.map.pillars.length; i++) {
        pillar = game.map.pillars[i];
        pillars.push({'x': pillar.x, 'y': pillar.y, 'h': config.Dists.PILLAR_HEIGHT, 'w': config.Dists.PILLAR_WIDTH});
    }
    
    // Send init game state
    socket.emit('map.init', {
        config: {
            maps: {
                'height': config.Dists.MAP_HEIGHT,
                'width':  config.Dists.MAP_WIDTH,
                'pillars': pillars
            },
            player: {
                'id': player != undefined ? player.character.id : -1
            }
        },
        state: []
    });

    sendGameState(socket);
}

/**
 *  Regarding game state, send some event to clients
 */
function sendGameState(socket) {
    // After player connection, handle the
    switch(game.state)
    {
        // no more players, must wait
        case config.GameStates.AWAITING_PLAYERS:
            socket.emit('game.awaiting');
            break;

        // game will start 
        case config.GameStates.READY:
            // Milliseconds between game.ready and game.start
            count_down = config.Games.TIME_WAITING * 1000;

            // Inform client that game will soon start
            utils.emitAll(socket, 'game.ready', {count_down: count_down});

            // Game will start in few second
            setTimeout(function() {
                utils.emitAll(socket, 'game.start');
                game.start(socket, utils);
            }, count_down);

            // Game start !
            game.prepareStart(socket, utils);
            break;
    }
}

