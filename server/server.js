//*******
//** Config
//*******
var Config = require('./config').Config;
var config = new Config();
//*******

//*******
//** Class
//*******
var PlayerInputEvent = require('./playerInputEvent').PlayerInputEvent;
var player_input_event = new PlayerInputEvent();
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
var fs 		= require('fs');

// Server listening
var app = http.listen(config.port, config.host);
var io  = socket.listen(app);
console.log('Server running at http://'+config.host+':'+config.port+'/');

// Client behavior
io.sockets.on('connection', function(socket) 
{
    socket.on('attack', function() { 
        player_input_event.attack(socket);
    });
});
