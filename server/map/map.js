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
			borderSpace = 50;

		this.pillars.push(
			new Pillar(parseInt(mapH / 2), parseInt(mapW / 2)),
			new Pillar(borderSpace, borderSpace),
			new Pillar(mapW - borderSpace, borderSpace),
			new Pillar(borderSpace, mapH - borderSpace),
			new Pillar(mapW - borderSpace, mapH - borderSpace)
		);
	}
};

exports.Map = Map;