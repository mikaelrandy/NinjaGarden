function NinjaParty() {

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
this.playerHeight = 20;
this.playerWidth = 16;
this.renderingMode = "Canvas";
this.fpsCounter = 128;
this.fpsTimer = (new Date()).getTime();
this.showFps = false;
this.predictiveEngine = true;


this.initEngine = function() {
	Crafty.init(this.mapWidth, this.mapHeight);
	Crafty.background('url('+this.mapBackgroundImage+')');
	this.loadSprites();
	this.loadCraftyCharacterComponent();
};

this.loadSprites = function() {
	Crafty.sprite(16, "images/sprite.png", { ninja: [0,3] });
};

this.loadCraftyCharacterComponent = function () {
	var States = this.States;
	var Compass = this.Compass;
	var renderingMode = this.renderingMode;
	var mapHeight = this.mapHeight ;
	var mapWidth = this.mapWidth ;
	var playerHeight = this.playerHeight;
	var playerWidth = this.playerWidth;
	Crafty.c("Character", {
		state: States.MOVING ,
		bounce: function() {
			if ((this.dir & Compass.N) && this.y <= 0) this.dir = this.dir - Compass.N + Compass.S ;
			else if ((this.dir & Compass.S) && this.y >= mapHeight - playerHeight) this.dir = this.dir - Compass.S + Compass.N ;
			if ((this.dir & Compass.W) && this.x <= 0) this.dir = this.dir - Compass.W + Compass.E ;
			else if ((this.dir & Compass.E) && this.x >= mapWidth - playerWidth) this.dir = this.dir - Compass.E + Compass.W ;		
		},
		continueMove: function(step) {
			if (this.dir & Compass.N) this.y -= step ;
			else if (this.dir & Compass.S) this.y += step ;
			if (this.dir & Compass.E) this.x += step ;
			else if (this.dir & Compass.W) this.x -= step ;
		},
		init: function() {
			this.addComponent("2D, "+renderingMode+", Color");
		}
	})
};

this.initGame = function (frame) {

	this.loadServerFrame(frame) ; 

	this.remainingMilliseconds = 0;
	this.lastStepTime = this.fpsTimer = this.startedTime = (new Date()).getTime() ;

	this.loadEngineBindings();
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
			ninjaParty.characters[i] = Crafty.e("Character, 2D, Canvas, ninja, SpriteAnimation")
				.attr( { 
						x: data.x, 
						y: data.y, 
						w: ninjaParty.playerWidth, 
						h: ninjaParty.playerHeight, 
						dir: data.dir, 
						state: data.state
				})
				.animate("walk_left", 6, 3, 8)
				.animate("walk_right", 9, 3, 11)
				.animate("walk_up", 3, 3, 5)
				.animate("walk_down", 0, 3, 2)
				.animate("walk_down", 15, -1)
				;
		} else {
			var c = ninjaParty.characters[i] ;
			c.move(c.x, c.y);
			if (i != ninjaParty.playerId) c.dir = data.dir ;
			c.state = data.state ;
		}
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
	if (this.player) this.player.dir = dir ;
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
	if (!this.player || (this.player.dir != madir)) changeDirection(madir) ;
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
	if (this.player.old_color) {
		this.player.color(this.player.old_color) ;
		this.player.old_color = false;
	} else {
		this.player.old_color = this.player.color() ;
		this.player.color('rgb(255,0,0)');
	}
	if (this.showDebug) console.log("CHEATING, my player is in red");
};

this.attack = function () {
	if (this.showDebug) console.log("Attack ! (from me)") ;	
};

this.smoke = function () {
	if (this.showDebug) console.log("Smoke ! (from me)") ;	
};

this.getSteps = function(t, f) {
	var elapsed = t - this.lastStepTime + this.remainingMilliseconds ;
	this.remainingMilliseconds = elapsed % this.millisecondForAStep ;
	var steps = (elapsed - this.remainingMilliseconds) / this.millisecondForAStep ;
	this.lastStepTime = t ;
	return steps ;
};



}