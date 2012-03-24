var counter = 1;

Character = function () {
	this.id = counter++;
	this.init();
}


Character.prototype = {
	init: function() {
		this.x = Utils.rand(Config.Dists.MAP_WIDTH);
		this.y = Utils.rand(Config.Dists.MAP_HEIGHT);
		this.dir = this.getRandDir();
		this.state = 0;
		this.stats = {
			'kills' :   [],
			'smokesLeft' :  Config.Games.NB_SMOKE,
			'pillars' : {},	// PillarId : Timestamp
			'stunts' :  []
		};
		this.decisionStack = [];
		this.events = [];
	},
	addEvent: function(eventName) {
		this.events.push(eventName);

		// TODO: need to be cleared after each export for client drawing
	},
	clearEvents: function() {
		this.events = [];
	},
	canPlay: function() {
		return [Config.States.STUNNED, Config.States.DEAD].indexOf(this.state) == -1;
	},
	// clear decision stack with stun state
	isStunned: function() {
		this.decisionStack = [{
			'decision' : new Decision(Config.States.STUNNED, null, null),
			'duration' : Config.Times.STUN_DURATION * Config.Times.NB_FRAME_SEC
		}];

		this.state = Config.States.STUNNED;
	},
	isDead: function() {
		this.decisionStack = [];
		this.state = Config.States.DEAD;
	},
	getRandDir: function() {
		var dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
		return Config.Compass[dirs[Utils.rand(dirs.length - 1)]];
	},
	getRandState: function() {
		return Utils.rand(10) == 5 ? 0 : Config.States.MOVING;
	},
	// move!
	continueMove: function() {
		if(this.state != Config.States.MOVING) {
			return;
		}
		var step = Config.Dists.STEP_PER_FRAME;

		this.bounce();

		if (this.dir & Config.Compass.N) this.y -= step ;
		else if (this.dir & Config.Compass.S) this.y += step ;
		if (this.dir & Config.Compass.E) this.x += step ;
		else if (this.dir & Config.Compass.W) this.x -= step ;
	},
	// bounce against the border of the map
	bounce: function() {
		if ((this.dir & Config.Compass.N) && this.y <= 0) this.dir = this.dir - Config.Compass.N + Config.Compass.S ;
		else if ((this.dir & Config.Compass.S) && this.y >= Config.Dists.MAP_HEIGHT - Config.Dists.PLAYER_HEIGHT) this.dir = this.dir - Config.Compass.S + Config.Compass.N ;
		if ((this.dir & Config.Compass.W) && this.x <= 0) this.dir = this.dir - Config.Compass.W + Config.Compass.E ;
		else if ((this.dir & Config.Compass.E) && this.x >= Config.Dists.MAP_WIDTH - Config.Dists.PLAYER_WIDTH) this.dir = this.dir - Config.Compass.E + Config.Compass.W ;		
	}
}

exports.Character = Character;
