

Character = function () {
	this.id = Character.counter++;
	this.init();
}

Character.counter = 1;
		
// for rand direction
Character.directions = [];
for (var i in Config.Compass) { 
	Character.directions.push(Config.Compass[i]) ; 
}
Character.dists = {
	halfPW: parseInt(Config.Dists.PLAYER_WIDTH / 2),
	halfPH: parseInt(Config.Dists.PLAYER_HEIGHT / 2),
	halfSPW: parseInt(Config.Dists.SPRITE_PLAYER_WIDTH / 2),
	halfSPH: parseInt(Config.Dists.SPRITE_PLAYER_HEIGHT / 2)
};

Character.prototype = {
	init: function() {
		this.x = Utils.rand(Config.Dists.MAP_WIDTH - 50) + 25;
		this.y = Utils.rand(Config.Dists.MAP_HEIGHT - 50) + 25;
		this.dir = this.getRandDir();
		this.state = this.getRandState();
		this.stats = {
			'kills' :   [],
			'smokesLeft' :  Config.Games.NB_SMOKE,
			'lastSmoke' : new Date().getTime(),
			'lastAttack' : new Date().getTime(),
			'pillars' : [],	// PillarIds
			'stunts' :  []
		};
		this.decisionStack = [];
		this.events = [];
	},
	addEvent: function(eventName, eventDatas) {
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
		return Character.directions[Utils.rand(Character.directions.length - 1)];
	},
	getRandState: function() {
		return Utils.rand(25) == 5 ? 0 : Config.States.MOVING;
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
		if ((this.dir & Config.Compass.N) && this.y <= Config.Dists.MAP_WALL_HEIGHT) 
			this.dir = this.dir - Config.Compass.N + Config.Compass.S ;
		else if ((this.dir & Config.Compass.S) && this.y >= Config.Dists.MAP_HEIGHT - Character.dists.halfSPH) 
			this.dir = this.dir - Config.Compass.S + Config.Compass.N ;
		if ((this.dir & Config.Compass.W) && this.x <= 0) 
			this.dir = this.dir - Config.Compass.W + Config.Compass.E ;
		else if ((this.dir & Config.Compass.E) && this.x >= Config.Dists.MAP_WIDTH - Character.dists.halfSPW) 
			this.dir = this.dir - Config.Compass.E + Config.Compass.W ;		
	}
}

exports.Character = Character;
