Decision = function(state, dir, evt) {
	this.state = state;
	this.dir = dir;
	this.evt = evt;
}

Decision.prototype = {
	isEvent: function() {
		return this.evt > 0;
	}
}

exports.Decision = Decision;