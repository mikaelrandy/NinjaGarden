/**
 *	Game manager
 * 	
 * 	Will manage game participation
 */
Game = function (gameStatesConfig, gameConfig) {
	this.config 			= [];
	this.config.game 		= gameConfig;
	this.config.gameStates 	= gameStatesConfig;

	this.init();
}

Game.prototype = {

	init: function() {
		this.playerStack 	= [];
		this.botStack		= [];
		this.ninjaStack		= [];	// compute once game is ready to start
		this.gameStartTime  = 0;
		this.gameEndTime    = 0;
		this.state 			= this.config.gameStates.AWAITING_PLAYERS;
		this.timer 			= null;
		this.director 		= null;
		this.map 			= new Map(Config);
		this.socket 		= null;
	},

	addPlayer: function(player) {
		// Is the game full ?
		if( this.playerStack.length >= this.config.game.NB_PLAYER )
			return false;

		// Cannot join a started game
		if( this.state == this.config.gameStates.STARTED )
			return false;

		this.playerStack.push(player);

		if( this.playerStack.length >= this.config.game.NB_PLAYER )
			this.state = this.config.gameStates.READY;

		return true;
	},

	addBot: function(bot) {
		if( this.botStack.length >= (this.config.game.MAX_NINJA - this.config.game.NB_PLAYER) )
			return false;

		this.botStack.push(bot);
		return true;
	},

	getNinjas: function() {
		var datas = [this.botStack, this.playerStack];
		return datas;
	},

	prepareStart: function(socket) {
		var i = 1;
        while (this.addBot(new Bot(new Character()))) {
            console.log('Add bot ' + i++);
        }


 		// define ninja stack
        this.ninjaStack = [];
        for(var i=0; i < this.playerStack.length; i++) {
        	this.ninjaStack.push(this.playerStack[i]);
        }
        for(var i=0; i < this.botStack.length; i++) {
        	this.ninjaStack.push(this.botStack[i]);
        }

		// load director
        this.director = new Director(this);
        this.socket = socket;

        // Send initial map state
		this.sendMapUpdate();
	},

	start: function(socket) {
		this.gameStartTime	= new Date().getTime();
		this.gameEndTime	= this.gameStartTime + this.config.game.MAX_DURATION * 1000;

        this.state = this.config.gameStates.STARTED;

		var that = this;
        this.timer = setInterval(function(){ that.processFrame() }, 30);
	},

	processFrame: function() {

		this.director.processNewFrame();
		this.sendMapUpdate();
	},

	sendMapUpdate: function() {
        Utils.emitAll(this.socket, 'map.update', this.getCurrentDatas());
	},

	getCurrentDatas: function() {
		var ninjaDatas = {};
		for(var i = 0; i < this.ninjaStack.length; i++) {
			var character = this.ninjaStack[i].character;
			ninjaDatas[character.id] = [character.x, character.y, character.dir, character.state, character.events, character.stats];
			character.clearEvents();
		}

		return {
        	'ninjas': ninjaDatas,
        	'times' : {'current': this.getCurrentTime(), 'left': this.getTimeLeft()}
        };
	},


	// return a time in milliseconds
	getCurrentTime: function() {
		return this.gameStartTime == 0 ? 0 : new Date().getTime() - this.gameStartTime;
	},
	// return a time in milliseconds
	getTimeLeft: function() {
		return this.gameEndTime == 0 ? 0 : this.gameEndTime - new Date().getTime();
	},
	// called by the directort (likely if a player got all pillars)
	notifyWinner: function(winnerPlayer) {
		// TODO: end the game
	}
};

exports.Game = Game;