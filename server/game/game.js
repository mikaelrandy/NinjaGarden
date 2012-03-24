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
		this.gameStartTime  = 0;
		this.state 			= this.config.gameStates.AWAITING_PLAYERS;
		// TODO: move this in the real start method
		this.gameStartTime	= new Date().getTime();
		this.gameEndTime	= this.gameStartTime + this.config.Games.MAX_DURATION * 1000;
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

	doStart: function(socket) {
		var i = 1;
        while (this.addBot(new Bot(new Character()))) {
            console.log('Add bot ' + i++);
        }

        this.state = this.config.gameStates.STARTED;

        var ninjas = this.getNinjas();
        var updates = setInterval(function () {
        	socket.emit('update.map', ninjas);
	        socket.broadcast.emit('update.map', ninjas);
	    }, 30, socket, ninjas);
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