var http    = require('http');
var io      = require('socket.io');

var app     = http.createServer();

app.listen(1337, '192.168.1.37');
io.listen(app);
console.log('Server running at http://192.168.1.37:1337/');


/*io.sockets.on('connection', function(socket) {
    console.log('Event connnection');
});*/