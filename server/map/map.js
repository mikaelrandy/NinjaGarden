/**
 *	Map
 */
Map = function(config) {
	this.config = config;
	this.pillars = [];

	this.init();
}

Map.prototype = {

	/**
	 *	Map initialisation
	 */
	init: function() {
		this.createPillars();
	},

	createPillars: function() {
		var mapH = this.config.Dists.MAP_HEIGHT, 
			mapW = this.config.Dists.MAP_WIDTH,
			pillarHW = parseInt(this.config.Dists.PILLAR_WIDTH / 2),
			pillarHH = parseInt(this.config.Dists.PILLAR_HEIGHT),
			hRef = this.config.Dists.MAP_WALL_HEIGHT - pillarHH;
			borderSpace = 50;

		this.pillars.push(
			new Pillar(parseInt(mapW / 2) - pillarHW, parseInt(mapH / 2) + hRef),
			new Pillar(borderSpace - pillarHW, borderSpace + hRef),
			new Pillar(mapW - borderSpace - pillarHW, borderSpace + hRef),
			new Pillar(borderSpace - pillarHW, mapH - borderSpace + hRef),
			new Pillar(mapW - borderSpace - pillarHW, mapH - borderSpace + hRef)
		);
	}
};

exports.Map = Map;