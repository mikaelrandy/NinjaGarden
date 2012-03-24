//*******
//** Configuration
//*******
var remote_host = '192.168.1.60';
var remote_port = 1337;
//*******


//*******
//** Class event
//*******
function attack(socket) {
    socket.broadcast.emit('refreshFrame');
    console.log('attack !!!');
}
//*******


// Servers initialisation
var http    = require('http').createServer();
var socket  = require('socket.io');

// Server listening
var app = http.listen(remote_port, remote_host);
var io  = socket.listen(app);
console.log('Server running at http://'+remote_host+':'+remote_port+'/');

// Client behavior
io.sockets.on('connection', function(socket) 
{
    socket.on('event1', function() { 
        attack(socket);
    });
});
