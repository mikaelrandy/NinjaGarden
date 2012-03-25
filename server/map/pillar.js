Pillar = function(x, y) {
	this.x = x;
	this.y = y;
	this.id = Pillar.counter++;
}

Pillar.counter = 0;

Pillar.prototype = {
	/**
	 *	Pillar initialisation
	 */
	init: function() {
		
	},
};

exports.Pillar = Pillar;