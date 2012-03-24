Utils = {
	rand: function(max) {
		return Math.abs(Math.round(Math.random() * max));
	}


	/**
	 *  emit message trought broadcast transport AND origin 
	 */
	emitAll: function(socket, eventname, datas)
	{
	    socket.emit(eventname, datas);
	    socket.broadcast.emit(eventname, datas);
	}
}

exports.Utils = Utils;