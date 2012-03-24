var counter = 1;

Character = function () {
	this.id = counter++;
	this.init();
}


Character.prototype = {
	init: function() {
		this.x = Utils.rand(0, 50);	// TODO: replace with max map coord
		this.y = Utils.rand(0, 100);	// TODO: replace with max map coord
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
			'decision' : new Decision(Config.States.STUNNED, null, null),
			'duration' : Config.Times.STUN_DURATION * Config.Times.NB_FRAME_SEC
		}];

		this.state = Config.States.STUNNED;
	},
	getRandDir: function() {
		var dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
		return Config.Compass[dirs[Utils.rand(dirs.length - 1)]];
	},
	getRandState: function() {
		return Utils.rand(10) == 5 ? 0 : Config.States.MOVING;
	},
	continueMove: function() {
		var step = Dists.STEP_PER_FRAME;
		this.bounce();
		if (this.dir & Compass.N) this.y -= step ;
		else if (this.dir & Compass.S) this.y += step ;
		if (this.dir & Compass.E) this.x += step ;
		else if (this.dir & Compass.W) this.x -= step ;
	},
	// bounce against the border of the map
	bounce: function() {
		if ((this.dir & Compass.N) && this.y <= 0) this.dir = this.dir - Compass.N + Compass.S ;
		else if ((this.dir & Compass.S) && this.y >= Config.Dists.MAP_HEIGHT - Config.Dists.PLAYER_HEIGHT) this.dir = this.dir - Compass.S + Compass.N ;
		if ((this.dir & Compass.W) && this.x <= 0) this.dir = this.dir - Compass.W + Compass.E ;
		else if ((this.dir & Compass.E) && this.x >= Config.Dists.MAP_WIDTH - Config.Dists.PLAYER_WIDTH) this.dir = this.dir - Compass.E + Compass.W ;		
	}
}

exports.Character = Character;
