function NinjaParty(socket) {

this.socket = socket ;

// Constantes
this.Compass = { N:1, E:2, S:4, W:8, NE:3, NW:9, SE:6, SW: 12};
this.Directions = [ ] ;
for (var i in this.Compass) { this.Directions.push(this.Compass[i]) ; } ;
this.States = { WAITING:0, MOVING:1, STUNNED: 2, DEAD: 4 };
this.Events = { NOACTION:0, ATTACK:1, SMOKE:2, KILLED:4, STUNNED:8, ON_PILLAR:16 };

// Mapping touches -> action
this.Keys = { 
	N: Crafty.keys.UP_ARROW, 
	S: Crafty.keys.DOWN_ARROW, 
	E: Crafty.keys.RIGHT_ARROW, 
	W: Crafty.keys.LEFT_ARROW, 

	ATTACK: Crafty.keys.A, 
	SMOKE: Crafty.keys.S, 
	CHEAT: Crafty.keys.C, 
	DEBUG: Crafty.keys.D 
};

// Config actions
this.allowCheat = true;
this.allowPlayerStop = false; // change to allow user to stop
this.persistKeys = false;
this.autoMove = false;
this.startWithAutoMove = false; 
this.showDebug = true;
this.showFrequentDebug = false;
this.currentDir = 0;
this.currentRealDir = 0;
this.currentState = 0;

// Liste des personnages à l'écran
this.characters = [ ];
this.player = null;
this.playerId = -1;
this.pillars = [ ];

// vitesse de jeu
this.millisecondForAStep = 25;
this.attackFrameNumber = 10;
this.remainingMilliseconds = 0;
this.lastStepTime = null;

// durée du jeu
this.startedTime = null;
this.elapsedTime = null;
this.endTime = null;

// Graphique
this.mapBackgroundImage = "images/sprites/room.png";
this.playerHeight = 40;
this.playerWidth = 40;
this.mapWidth = 0;
this.mapHeight = 0;
this.renderingMode = "Canvas";
this.fpsCounter = 128;
this.fpsTimer = (new Date()).getTime();
this.showFps = false;
this.predictiveEngine = false; // OFF if all movements are from server
this.sounds = { 
	open: "start2.wav" ,
	tambour: "start.wav",
	pillar: "start2.wav",
	hit: "hit.wav"
};
this.sprites = {
	ninja: {
		tile: 40,
		file: "images/sprites/ninja.png",
		data: { Ninja: [0,3] }
	},
	pillar: {
		tile: 16,
		file: "images/sprites/garden.png",
		data: { PillarSprite: [0,1,1,2] }
	},
	smoke: {
		tile: 120,
		file: "images/sprites/smoke.png",
		data: { SmokeSprite: [0,0] }
	}
}


this.initEngine = function() {
	if (!this.initialized) {
		if (this.showDebug) console.log("init Engine") ;
		Crafty.init(this.mapWidth, this.mapHeight);
		Crafty.background('url('+this.mapBackgroundImage+')');
		this.loadSprites();
		for (var i in this.sounds) {
			Crafty.audio.add(i, this.sounds[i]);
		}
		this.loadCraftyCharacterComponent();
		this.loadCraftyPillarComponent();
		this.loadCraftySmokeComponent();
	}
	
	this.initialized = true;
};

this.resetCharacter = function(i) {
	if (this.showDebug) console.log("Deleted player ! ", i);
	var c = this.characters[i] ;
	if (c._children) {
		for (var i = 0; i < x._children.length; i++) {
			if (c._children[i].destroy) {
				c._children[i].destroy();
			}
		}
		c._children = [];
		c.x = -1000 ;
		c.y = -1000;
	}
	Crafty.map.remove(c);
	c.detach();
	delete i in this.characters;
};

this.loadSprites = function() {
	// temp sprite, waiting designer
	var ninja 	= this.sprites.ninja;
	var pillar 	= this.sprites.pillar;
	var smoke 	= this.sprites.smoke;

	Crafty.sprite(ninja.tile, ninja.file, ninja.data);
	Crafty.sprite(pillar.tile, pillar.file, pillar.data);
	Crafty.sprite(smoke.tile, smoke.file, smoke.data);
};

this.loadCraftyPillarComponent = function() {
	var renderingMode = this.renderingMode;
	Crafty.c("Pillar", {
		init: function() {
			// bas haut droite gauche
			this.addComponent("2D, "+renderingMode+", PillarSprite, SpriteAnimation");
			// TODO - add beautiful sprite
		},
		highlight: function () {
			// TODO - change sprite for pillar highlight
		}, 
	});
};

this.loadCraftySmokeComponent = function() {
	var renderingMode = this.renderingMode;
	Crafty.c("Smoke", {
		init: function() {
			this.addComponent("2D, "+renderingMode+", SmokeSprite, SpriteAnimation");
			this.animate("explode", 0, 0, 10);
		}
	});
};

this.loadCraftyCharacterComponent = function () {
	var attackFrameRemaining = 0;
	var States = this.States;
	var Compass = this.Compass;
	var renderingMode = this.renderingMode;
	var mapHeight = this.mapHeight ;
	var mapWidth = this.mapWidth ;
	var playerHeight = this.playerHeight;
	var playerWidth = this.playerWidth;
	var showDebug = this.showDebug ;
	ninjaParty = this;
	Crafty.c("Character", {
		state: States.MOVING ,
		isMyPlayer: false,
		bounce: function() {
			if ((this.direction & Compass.N) && this.y <= 0) this.direction = this.direction - Compass.N + Compass.S ;
			else if ((this.direction & Compass.S) && this.y >= mapHeight - playerHeight) this.direction = this.direction - Compass.S + Compass.N ;
			if ((this.direction & Compass.W) && this.x <= 0) this.direction = this.direction - Compass.W + Compass.E ;
			else if ((this.direction & Compass.E) && this.x >= mapWidth - playerWidth) this.direction = this.direction - Compass.E + Compass.W ;
			this.updateDirectionAnimation();
		},
		continueMove: function(step) {
			if (this.direction & Compass.N) this.y -= step ;
			else if (this.direction & Compass.S) this.y += step ;
			if (this.direction & Compass.E) this.x += step ;
			else if (this.direction & Compass.W) this.x -= step ;
		},
		init: function() {
			// bas haut droite gauche
			this.addComponent("2D, "+renderingMode+", Ninja, SpriteAnimation");
			this.animate("walk_down", 0, 0, 2)
				.animate("walk_up", 0, 1, 2)
				.animate("walk_right", 0, 2, 2)
				.animate("walk_left", 0, 3, 2)
				.animate("stunned_left", 0, 8, 0)
				.animate("stunned_right", 1, 8, 1)
				.animate("attack_down", 0, 4, 2)
				.animate("attack_up", 0, 5, 2)
				.animate("attack_right", 0, 6, 2)
				.animate("attack_left", 0, 7, 2);
			;
		},
		changeDirection: function (newdir) {
			this.direction = newdir;
			this.updateDirectionAnimation();
		},
		updateDirectionAnimation: function()
		{
			// attackFrameRemaining decreased on enterFrame event
			if(typeof this.attackFrameRemaining != 'undefined' && this.attackFrameRemaining > 0)
				return;

			if (this.direction & Compass.N) {
				if (!this.isPlaying('walk_up'))	this.stop().animate("walk_up", 30, -1);
			} else if (this.direction & Compass.S) {
				if (!this.isPlaying('walk_down')) this.stop().animate("walk_down", 30, -1);
			} else if (this.direction & Compass.W) {		
				if (!this.isPlaying('walk_left')) this.stop().animate("walk_left", 30, -1);
			} else if (this.direction & Compass.E) {
				if (!this.isPlaying('walk_right')) this.stop().animate("walk_right", 30, -1);
			} else {
				this.stop();
			}
		},

		changeState: function (newstate) {
			this.state = newstate ;
			if (this.state == States.STUNNED) {
				this.stunned();
			} else if (this.state == States.DEAD) {
				this.killed();
			}
		},
		
		attack: function () {
			Crafty.audio.play("hit");
			this.attackFrameRemaining = ninjaParty.attackFrameNumber;

			if (this.direction & Compass.N) {
				if (!this.isPlaying('attack_up')) this.stop().animate("attack_up", ninjaParty.attackFrameNumber, 0);
			} else if (this.direction & Compass.S) {
				if (!this.isPlaying('attack_down')) this.stop().animate("attack_down", ninjaParty.attackFrameNumber, 0);
			} else if (this.direction & Compass.W) {		
				if (!this.isPlaying('attack_left')) this.stop().animate("attack_left", ninjaParty.attackFrameNumber, 0);
			} else if (this.direction & Compass.E) {
				if (!this.isPlaying('attack_right')) this.stop().animate("attack_right", ninjaParty.attackFrameNumber, 0);
			}
			// TODO - sound
			// TODO - change sprite for some milliseconds
		},
		
		smoke: function () {
			var smokee = Crafty.e("Smoke")
				.attr({
						x: this.x + (this.w / 2) - 60, 
						y: this.y + (this.h / 2) - 60, 
						z: 10000, 
						w: 120, 
						h: 120
				})
				.timeout(function(){
					this.destroy();
					console.log('destroy');
				}, 6600);
				smokee.stop().animate("explode", 300, 0);
			// TODO - sound
		},

		stunned: function () {
			if (this.direction & Compass.W) {		
				if (!this.isPlaying('stunned_right')) this.stop().animate("stunned_right", 15, 0);
			} else if (this.direction) {
				if (!this.isPlaying('stunned_left')) this.stop().animate("stunned_left", 15, 0);
			} else {
				this.stop();
			}
		},

		killed: function() {
			if (this.direction & Compass.W) {		
				if (!this.isPlaying('stunned_right')) this.stop().animate("stunned_right", 15, 0);
			} else if (this.direction) {
				if (!this.isPlaying('stunned_left')) this.stop().animate("stunned_left", 15, 0);
			} else {
				this.stop();
			}
		},

		onPillar: function() {
			Crafty.audio.play("pillar");
			// TODO - change sprite for some milliseconds
		} 
	})
};

this.prepareGame = function (data) {
	var countdown = data.count_down;
	if (this.showDebug) console.log("Prepare Game", this.characters);
	Crafty.audio.play("tambour");
	
	this.loadEngineBindings();
}

this.prepareCharactersForReset = function () {
	if (this.showDebug) console.log("Prepare for reset ",this.characters);
	this.characters.forEach( 
		function (c,i) { 
			c.toBeReseted = true ; 
			c.x = -100 ; 
			c.y = -100; 
			if (this.showDebug) console.log("reset ? player ",i);
		}
	);
	this.player = null ;
}

this.initGame = function () {
	var showDebug = this.showDebug;
	this.remainingMilliseconds = 0;
	this.lastStepTime = this.fpsTimer = this.startedTime = (new Date()).getTime() ;
	console.log("play !");
	Crafty.audio.play("open");
	this.showFrequentDebug = false ;
};

this.loadEngineBindings = function () {
	if (this.binded) return;
	this.binded = true;
	var ninjaParty = this;
	var States = this.States;
	Crafty.bind("EnterFrame", function() {
		var t = (new Date()).getTime();
		var f = Crafty.frame();
		if (!ninjaParty.persistKeys) ninjaParty.getInputForInstantDirection();
		if (ninjaParty.predictiveEngine) {
			var steps = ninjaParty.getSteps(t);
			ninjaParty.characters.forEach( function(c) { 
				if (!c) return; 
				if (c.state & States.MOVING) {
					c.bounce(); 
					c.continueMove(steps, f); 
				} 
			} );
		}
		if (ninjaParty.showFps && ((f % ninjaParty.fpsCounter) == 0)) ninjaParty.countFPS(t);

		// decrease frame actions number
		ninjaParty.characters.forEach( function(character) {
			// attack
			if(character.attackFrameRemaining > 0) character.attackFrameRemaining--;
		});
	});

	Crafty.bind("KeyDown", function (e) {
		var key = e.key ;
		if (ninjaParty.persistKeys && ninjaParty.player) ninjaParty.getInputForPersistantDirection(key) ;
		ninjaParty.getInputForActions(key) ;
	});
}

this.loadServerFrame = function (frame) {
	if (!this.player) this.setPlayer();
	this.loadServerPlayers(frame.ninjas) ;
	this.loadServerTimes(frame.times);
	if (this.startWithAutoMove) this.startAutoMove() ;
};

this.loadServerTimes = function (times) {
	this.elapsedTime = times.current ;
	this.endTime = times.left ;
}

this.setPlayer = function (player) {
	if (player) {
		this.playerId = player.id ;
		if (this.showDebug) console.log("My player is ninja "+ this.playerId) ;
		this.characters.forEach( function(p,i) { if (!p) return ; p.isMyPlayer = false ; });
	}
	if ((this.playerId > 0) && this.characters[this.playerId]) {
		this.player = this.characters[this.playerId] ;
		this.player.isMyPlayer = true;
	}
};

this.startAutoMove = function () {
	if (this.showDebug) console.log("by startWithAutoMove") ;
	this.changeDirection( this.getRandomDirection() );
	this.startWithAutoMove = false;
	this.autoMove = true ;
};

this.getRandomDirection = function () {
	return this.Directions[ Crafty.math.randomInt(0, this.Directions.length - 1) ] ;
};

this.loadServerPlayers = function (players) {
	var ninjaParty = this;
	var playerHeight = this.playerHeight;
	var playerWidth = this.playerHeight;
	var Events = this.Events ;
	ninjaParty.characters.forEach( function (c,i) { c.toBeReseted = true ; } ) ;
	for (var i in players) {
		var data = players[i] ;
		data.x = data[0];
		data.y = data[1];
		data.direction = data[2];
		data.state = data[3];
		data.events = data[4];
		data.stats = data[5] ;
		if (! ninjaParty.characters[i]) {
			if (ninjaParty.showDebug) console.log("New ninja !", i);
			ninjaParty.characters[i] = Crafty.e("Character")
				.attr( { 
						x: data.x - ninjaParty.playerWidth / 4, 
						y: data.y - ninjaParty.playerHeight / 4, 
						z: data.y - ninjaParty.playerHeight / 4, 
						w: ninjaParty.playerWidth, 
						h: ninjaParty.playerHeight, 
						direction: data.direction, 
						state: data.state
				})
			ninjaParty.characters[i].toBeReseted = false ;
		} else {
			var c = ninjaParty.characters[i] ;
			c.toBeReseted = false ;
			if (ninjaParty.showFrequentDebug) console.log("previous position = " + c.x + " , " + c.y ) ;
			if (ninjaParty.showFrequentDebug) console.log("new position = " + data.x + " , " + data.y ) ;
			c.x = data.x - ninjaParty.playerWidth / 4 ;
			c.y = data.y - ninjaParty.playerHeight / 4 ;
			c.z = data.y - ninjaParty.playerHeight / 4 ;
			c.direction = data.direction ;
			if (i == ninjaParty.playerId) {
				ninjaParty.currentRealDir = data.direction ;
				if (c.state & ninjaParty.States.MOVING) ninjaParty.currentDir = data.direction ;
			}	 
			c.state = data.state ;
			c.updateDirectionAnimation();
		}
		// if (i != ninjaParty.playerId) 
		ninjaParty.characters[i].changeDirection(data.direction) ;
		ninjaParty.characters[i].changeState(data.state) ;
		ninjaParty.characters[i].stats = {
			smokeRemaining: data.stats[0],
			pillarValidated: data.stats[1]
		} ;
		data.events.forEach( function (event, j) {
			if (event == Events.ATTACK) ninjaParty.characters[i].attack();
			else if (event == Events.ATTACK) ninjaParty.characters[i].attack();
			else if (event == Events.SMOKE) ninjaParty.characters[i].smoke();
			else if (event == Events.ON_PILLAR) ninjaParty.characters[i].onPillar();
		}) ;
	} ;
	ninjaParty.characters.forEach( function (c,i) {
		if (c.toBeReseted) {
			if (ninjaParty.showDebug) console.log("reset player !! ", j)
			ninjaParty.resetCharacter(i);
		} else {
			//if (ninjaParty.showDebug) console.log("no reset player !! ", j)
		}
	});
};

this.getMyStats = function () {
	return this.player.stats ;
};

this.countFPS = function (t) {
	var elapsed = t - this.fpsTimer ;
	console.log("fps = " + (1000 * this.fpsCounter / elapsed)) ;
	this.fpsTimer = t ;
} ;

this.getInputForInstantDirection = function  () {
	var madir = 0 ;
	if (!!Crafty.keydown[this.Keys.N]) {
		madir += this.Compass.N ;
	}
	else if (!!Crafty.keydown[this.Keys.S]) madir += this.Compass.S ;
	if (!!Crafty.keydown[this.Keys.E]) madir += this.Compass.E ;
	else if (!!Crafty.keydown[this.Keys.W]) madir += this.Compass.W ;
	// if (this.showDebug && madir) console.log("by getInputForInstantDirection : ", madir) ;
	if ((this.currentDir != madir) && (madir || !this.autoMove)) {
		this.changeDirection(madir) ;
	}
};


this.changeDirection = function (direction) {
	// TODO - maybe some debug
	if (!direction && !this.allowPlayerStop) return ; //console.log("do not allow player stop");
	if (!direction && this.autoMove) return ; //console.log("still autoMove"); ;
	this.autoMove = false;
	if (this.showFrequentDebug) console.log("new direction '"+direction+"' (old was '"+this.currentDir+"')") ;
	this.currentDir = direction ;
	if (direction) {
		this.currentRealDir = direction;
		this.currentState = this.States.MOVING ;
	}
	if (!direction) this.currentState = 0 ;
	if (this.player && this.predictiveEngine) this.player.changeDirection(direction) ;
	this.sendStatusToServer();
};

this.getInputForPersistantDirection = function (key) {
	if (key == this.Keys.N) { 
		this.addPersistentDirection(this.Compass.N, this.Compass.S) ;
	} else if (key == this.Keys.S) { 
		this.addPersistentDirection(this.Compass.S, this.Compass.N) ;
	}
	if (key == this.Keys.E) { 
		this.addPersistentDirection(this.Compass.E, this.Compass.W) ;
	} else if (key == this.Keys.W) { 
		this.addPersistentDirection(this.Compass.W, this.Compass.E) ;
	}
};


this.addPersistentDirection = function (direction, opposite) {
	var madir = this.currentDir;
	if (madir & opposite) madir -= opposite ;
	else if (((madir & direction) == 0)) madir += direction ;
	if (!this.player || (this.player.direction != madir)) {
		if (this.showDebug) console.log("by addPersistentDirection");
		this.changeDirection(madir) ;
	}
};

this.getInputForActions = function (key) {
	switch (key) {
	case this.Keys.ATTACK: 
		this.attack();
		break;
	case this.Keys.SMOKE:
		this.smoke();
		break;
	case this.Keys.DEBUG:
		this.debugPosition();
		break;
	case this.Keys.CHEAT:
		this.cheatAndFindOwnPlayer();
		break;
	default:
		console.log(key);
		break;
	}
};

this.debugPosition = function () {
	console.log("DEBUG my position is = "+this.player.direction+" , x = "+this.player.x+" , y = "+this.player.y) ;
};

this.cheatAndFindOwnPlayer = function() {
	if (!this.player) return;
	if (this.player.cheated) {
		this.player.color('rgba(255,0,0,0)');
		this.player.cheated = false;
	} else {
		this.player.addComponent("Color");
		this.player.color('rgba(255,0,0,64)');
		this.player.cheated = true;
	}
	if (this.showDebug) console.log("CHEATING, my player is in red");
};

this.attack = function () {
	if (this.showDebug) console.log("Attack ! (from me)") ;	
	this.sendStatusToServer(this.Events.ATTACK);
	// (done when server send action:) if (this.player) this.player.attack() ;
};

this.smoke = function () {
	if (this.showDebug) console.log("Smoke ! (from me)") ;
	this.sendStatusToServer(this.Events.SMOKE);	
	// (done when server send action:) if (this.player) this.player.smoke() ;
};

this.sendStatusToServer = function(action) {
	// TODO - debug and check with server if correct syntax
	action = action || 0 ;
	this.reallySendActionToServer({
		direction: this.currentRealDir ,
		state: this.currentState ,
		action: action
	}) ;

}
this.reallySendActionToServer = function() {
	// FAKE : do not touch, 
	// will be overriden by ninjaPartyController#sendActionToServer
	if (this.showDebug) console.log("WHAT ? not server to send our actions to") ;
}

this.getSteps = function(t, f) {
	var elapsed = t - this.lastStepTime + this.remainingMilliseconds ;
	this.remainingMilliseconds = elapsed % this.millisecondForAStep ;
	var steps = (elapsed - this.remainingMilliseconds) / this.millisecondForAStep ;
	this.lastStepTime = t ;
	return steps ;
};

this.setPillar = function(index, data) {
	var pillar = Crafty.e("Pillar")
				.attr( { 
						x: data.x, 
						y: data.y, 
						w: data.w, 
						h: data.h,
						z: data.y
				});
	this.pillars[index] = pillar ;
};

this.endGame = function(data) {
	var States = this.States;
	// no ninja is moving anymore
	var States = this.States;
	this.characters.forEach(function(c,i) {
		if (!c) return ;
		c.state = c.state  & (~States.MOVING) ;
	});
	this.predictiveEngine = false;
	this.isKillerWin = data.isKillerWin ;
	this.isPillarWin = data.isPillarWin ;
	this.isTimeout =  data.timeout  ;
	this.hasPlayerWin = (this.playerId == data.winner) ;
	this.PlayerWin = data.winner ;
	this.nbAlivePlayers = data.nbAlivePlayers ;
};

}