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
var PlayerInputEvent    = require('./playerInputEvent').PlayerInputEvent;
var Game                = require('./game/game').Game;
var Character           = require('./character/character').Character;
var Bot                 = require('./character/bot').Bot;
var Player              = require('./character/player').Player;

var player_input_event  = new PlayerInputEvent();
var game                = new Game(config.GameStates, config.Games);
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

// Client behavior
io.sockets.on('connection', function(socket) {
    // Reset game
    socket.on('game.reset', function() {
        game.init();
        game.addPlayer(new Player(new Character()));
        sendGameState(socket);
    });

    // Check if player can join the game
    if( !game.addPlayer(new Player(new Character())) ) {
        socket.emit('game.cannot_join')
        return false;
    }
    
    sendGameState(socket);

    // Event on player
    socket.on('attack', function() { 
        player_input_event.attack(socket);
    });

    // Send event defined by client (for debug purpoise )
    socket.on('debug.ask', function(data) {
        socket.emit(data[0], data[1]);
    });
});

io.sockets.on('disconnect', function(socket) {
    // TODO : kill player but keep game started
});


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
            var i = 1;
            while (game.addBot(new Bot(new Character()))) {
                console.log('Add bot ' + i++);
            }
            socket.emit('game.start');
            break;
    }
}
