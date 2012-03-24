function Character(id) {
	this.id = id;
	this.init();
}

Character.states = ['walk', 'stop', 'dead', 'stunt'];
Character.dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];


Character.prototype = {
	rand: function(max) {
  		return Math.abs(Math.round(Math.random() * upper));
	},
	init: function() {
		this.x = this.rand(0, 50);	// TODO: replace with max map coord
		this.y = this.rand(0, 100);	// TODO: replace with max map coord
		this.dir = Character.dirs[this.rand(Character.dirs.length)];
		this.state = Character.states[this.rand(Character.states.length)];
		this.stats = {
			'kills' : {},
			'smokes' : {},
			'pillars' : {},
			'stunts' : {}
		};
		this.decisionStack : [];
		this.events: [];
	}
}