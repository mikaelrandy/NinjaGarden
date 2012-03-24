function NinjaParty(socket) {

this.socket = socket ;

// Constantes
this.Compass = { N:1, E:2, S:4, W:8, NE:3, NW:9, SE:6, SW: 12};
this.Directions = [ ] ;
for (var i in this.Compass) { this.Directions.push(this.Compass[i]) ; } ;
this.States = { WAITING:0, MOVING:1, STUNNED: 2, DEAD: 4 };
this.Events = { NOACTION:0, ATTACK:1, SMOKE:2 };

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
this.allowPlayerStop = false;
this.persistKeys = false;
this.autoMove = false;
this.startWithAutoMove = true;
this.showDebug = true;
this.currentDir = 0;

// Liste des personnages à l'écran
this.characters = [ ];
this.player = null;
this.playerId = NaN;

// vitesse de jeu
this.millisecondForAStep = 25;
this.remainingMilliseconds = 0;
this.lastStepTime = null;

// durée du jeu
this.startedTime = null;
this.endTime = null;

// Graphique
this.mapBackgroundImage = "floor.jpg";
this.mapHeight = 640;
this.mapWidth = 960;
this.playerHeight = 40;
this.playerWidth = 40;
this.renderingMode = "Canvas";
this.fpsCounter = 128;
this.fpsTimer = (new Date()).getTime();
this.showFps = false;
this.predictiveEngine = true;
this.sounds = { 
	open: "start.wav" ,
	tambour: "tambour.wav",
};
this.sprites = {
	ninja: {
		tile: 40,
		file: "images/sprites/ninja.png",
		data: { Ninja: [0,3] }
	}
}


this.initEngine = function() {
	Crafty.init(this.mapWidth, this.mapHeight);
	Crafty.background('url('+this.mapBackgroundImage+')');
	this.loadSprites();
	for (var i in this.sounds) {
		Crafty.audio.add(i, this.sounds[i]);
	}
	this.loadCraftyCharacterComponent();
};

this.loadSprites = function() {
	// temp sprite, waiting designer
	var ninja = this.sprites.ninja;
	Crafty.sprite(ninja.tile, ninja.file, ninja.data);
};

this.loadCraftyCharacterComponent = function () {
	var States = this.States;
	var Compass = this.Compass;
	var renderingMode = this.renderingMode;
	var mapHeight = this.mapHeight ;
	var mapWidth = this.mapWidth ;
	var playerHeight = this.playerHeight;
	var playerWidth = this.playerWidth;
	var showDebug = this.showDebug ;
	Crafty.c("Character", {
		state: States.MOVING ,
		bounce: function() {
			if ((this.dir & Compass.N) && this.y <= 0) this.dir = this.dir - Compass.N + Compass.S ;
			else if ((this.dir & Compass.S) && this.y >= mapHeight - playerHeight) this.dir = this.dir - Compass.S + Compass.N ;
			if ((this.dir & Compass.W) && this.x <= 0) this.dir = this.dir - Compass.W + Compass.E ;
			else if ((this.dir & Compass.E) && this.x >= mapWidth - playerWidth) this.dir = this.dir - Compass.E + Compass.W ;

			this.updateAnimation();
		},
		continueMove: function(step) {
			if (this.dir & Compass.N) this.y -= step ;
			else if (this.dir & Compass.S) this.y += step ;
			if (this.dir & Compass.E) this.x += step ;
			else if (this.dir & Compass.W) this.x -= step ;
		},
		init: function() {
			// bas haut droite gauche
			this.addComponent("2D, "+renderingMode+", Ninja, SpriteAnimation");
			this.animate("walk_down", 0, 0, 2)
				.animate("walk_up", 0, 1, 2)
				.animate("walk_right", 0, 2, 2)
				.animate("walk_left", 0, 3, 2)
			;
		},
		changeDirection: function (newdir) {
			this.dir = newdir;
			this.updateAnimation();
		},
		updateAnimation: function()
		{
			if (this.dir & Compass.N) {
				if (!this.isPlaying('walk_up'))	this.stop().animate("walk_up", 15, -1);
			} else if (this.dir & Compass.S) {
				if (!this.isPlaying('walk_down')) this.stop().animate("walk_down", 15, -1);
			} else if (this.dir & Compass.W) {		
				if (!this.isPlaying('walk_left')) this.stop().animate("walk_left", 15, -1);
			} else if (this.dir & Compass.E) {
				if (!this.isPlaying('walk_right')) this.stop().animate("walk_right", 15, -1);
			} else {
				this.stop();
			}
		},

		changeState: function (newstate) {
			this.state = newstate ;
		},
		
		attack: function () {
		},
		
		smoke: function () {
		}
	})
};

this.prepareGame = function (data) {
	var countdown = data.count_down;
	Crafty.audio.play("tambour");
	this.loadEngineBindings();
}


this.initGame = function (frame) {
	this.loadServerFrame(frame) ; 
	this.remainingMilliseconds = 0;
	this.lastStepTime = this.fpsTimer = this.startedTime = (new Date()).getTime() ;
	Crafty.audio.play("open");
};

this.loadEngineBindings = function () {
	ninjaParty = this;
	var States = this.States;
	Crafty.bind("EnterFrame", function() {
		var t = (new Date()).getTime();
		var f = Crafty.frame();
		if (!ninjaParty.persistKeys && ninjaParty.player) ninjaParty.getInputForInstantDirection();
		if (ninjaParty.predictiveEngine) {
			var steps = ninjaParty.getSteps(t);
			ninjaParty.characters.forEach( function(c) {  
				if (c.state & States.MOVING) {
					c.bounce(); 
					c.continueMove(steps, f); 
				} 
			} );
		}
		if (ninjaParty.showFps && ((f % ninjaParty.fpsCounter) == 0)) ninjaParty.countFPS(t);
	});

	Crafty.bind("KeyDown", function (e) {
		var key = e.key ;
		if (ninjaParty.persistKeys && ninjaParty.player) ninjaParty.getInputForPersistantDirection(key) ;
		ninjaParty.getInputForActions(key) ;
	});
}

this.loadServerFrame = function (frame) {
	this.loadServerPlayers(frame.players) ;
	this.setPlayerId(frame.playerId);
	if (this.startWithAutoMove) this.startAutoMove() ;
};

this.setPlayerId = function (playerId) {
	this.playerId = playerId ;
	this.player = this.characters[this.playerId] ;
};

this.startAutoMove = function () {
	this.changeDirection( this.getRandomDirection() );
	this.autoMove = true ;
};

this.getRandomDirection = function () {
	return this.Directions[ Crafty.math.randomInt(0, this.Directions.length - 1) ] ;
};

this.loadServerPlayers = function (players) {
	var ninjaParty = this;
	var playerHeight = this.playerHeight;
	var playerWidth = this.playerHeight;
	players.forEach( function (data, i) {
		if (! ninjaParty.characters[i]) {
			ninjaParty.characters[i] = Crafty.e("Character")
				.attr( { 
						x: data.x, 
						y: data.y, 
						w: ninjaParty.playerWidth, 
						h: ninjaParty.playerHeight, 
						dir: data.dir, 
						state: data.state
				})
		} else {
			var c = ninjaParty.characters[i] ;
			c.move(c.x, c.y);
			if (i != ninjaParty.playerId) c.dir = data.dir ;
			c.state = data.state ;
		}
		if (i != ninjaParty.playerId) ninjaParty.characters[i].changeDirection(data.dir) ;
		ninjaParty.characters[i].changeState(data.state) ;
	}) ;
};


this.countFPS = function (t) {
	var elapsed = t - this.fpsTimer ;
	console.log("fps = " + (1000 * this.fpsCounter / elapsed)) ;
	this.fpsTimer = t ;
} ;

this.getInputForInstantDirection = function  () {
	var madir = 0 ;
	if (!!Crafty.keydown[this.Keys.N]) madir += this.Compass.N ;
	else if (!!Crafty.keydown[this.Keys.S]) madir += this.Compass.S ;
	if (!!Crafty.keydown[this.Keys.E]) madir += this.Compass.E ;
	else if (!!Crafty.keydown[this.Keys.W]) madir += this.Compass.W ;
	if (!this.player || (this.player.dir != madir)) this.changeDirection(madir) ;
};


this.changeDirection = function (dir) {
	if (!dir && !this.allowPlayerStop) return ;
	if (!dir && this.autoMove) return ;
	this.autoMove = false;
	if (this.showDebug) {
		console.log("new direction '"+dir+"' (old was '"+((!this.player) ? 'unknown' : this.player.dir)+"')")
	}
	this.currentDir = dir ;
	if (this.player) this.player.changeDirection(dir) ;
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


this.addPersistentDirection = function (dir, opposite) {
	var madir = this.currentDir;
	if (madir & opposite) madir -= opposite ;
	else if (((madir & dir) == 0)) madir += dir ;
	if (!this.player || (this.player.dir != madir)) this.changeDirection(madir) ;
};

this.getInputForActions = function (key) {
	if (key == this.Keys.ATTACK) { 
		this.attack() ;
	} else if (key == this.Keys.SMOKE) {
		this.smoke() ;
	} else if (key == this.Keys.DEBUG) {
		this.debugPosition();
	} else if (key == this.Keys.CHEAT) {
		this.cheatAndFindOwnPlayer();	
	}
};

this.debugPosition = function () {
	console.log("DEBUG my position is = "+this.player.dir+" , x = "+this.player.x+" , y = "+this.player.y) ;
};

this.cheatAndFindOwnPlayer = function() {
	if (this.showDebug) console.log("CHEATING, my player is in red");
};

this.attack = function () {
	if (this.showDebug) console.log("Attack ! (from me)") ;	
	if (this.player) this.player.attack() ;
};

this.smoke = function () {
	if (this.showDebug) console.log("Smoke ! (from me)") ;	
	if (this.player) this.player.smoke() ;
};

this.getSteps = function(t, f) {
	var elapsed = t - this.lastStepTime + this.remainingMilliseconds ;
	this.remainingMilliseconds = elapsed % this.millisecondForAStep ;
	var steps = (elapsed - this.remainingMilliseconds) / this.millisecondForAStep ;
	this.lastStepTime = t ;
	return steps ;
};



}