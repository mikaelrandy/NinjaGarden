Character = function (id) {
	this.id = id;
	this.init();
}


Character.prototype = {
	init: function() {
		this.x = this.rand(0, 50);	// TODO: replace with max map coord
		this.y = this.rand(0, 100);	// TODO: replace with max map coord
		this.randomDir();
		this.randomState();
		this.stats = {
			'kills' : {},
			'smokes' : {},
			'pillars' : {},
			'stunts' : {}
		};
		this.decisionStack : [];
		this.events: [];
	},
	randomDir: function() {
		var dirs = dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
		this.dir = dirs[rand(dirs.length)];
	},
	randomState: function() {
		this.state = rand(10) == 5 ? 0 : States.MOVING;
	}
}