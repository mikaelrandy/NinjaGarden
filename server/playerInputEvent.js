function PlayerInputEvent() {

}

PlayerInputEvent.prototype = {
	attack: function(socket) {
  		socket.broadcast.emit('refreshFrame');
	}
}
exports.PlayerInputEvent = PlayerInputEvent;
