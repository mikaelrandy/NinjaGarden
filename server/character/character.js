Character = function (id) {
	this.id = id;
	this.init();
}


Character.prototype = {
	init: function() {
		this.x = rand(0, 50);	// TODO: replace with max map coord
		this.y = rand(0, 100);	// TODO: replace with max map coord
		this.dir = this.getRandDir();
		this.state = this.getRandState();
		this.stats = {
			'kills' : {},
			'smokes' : {},
			'pillars' : {},
			'stunts' : {}
		};
		this.decisionStack = [];
		this.events = [];
	},
	// clear decision stack with stun state
	isStunned: function() {
		this.decisionStack = [{
			'decision' : new Decision(States.STUNNED, null, null),
			'duration' : Times.STUN_DURATION * Times.NB_FRAME_SEC
		}];

		this.state = States.STUNNED;
	},
	getRandDir: function() {
		var dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
		return Card[dirs[rand(dirs.length - 1)]];
	},
	getRandState: function() {
		return rand(10) == 5 ? 0 : States.MOVING;
	}
}