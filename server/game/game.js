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
	// return a time in milliseconds
	getCurrentGameTime: function() {
		return this.gameStartTime == 0 ? 0 : new Date().getTime() - this.gameStartTime;
	},
	// called by the directort (likely if a player got all pillars)
	notifyWinner: function(winnerPlayer) {
		// TODO: end the game
	}
};

exports.Game = Game;