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
		this.state 			= this.config.gameStates.AWAITING_PLAYERS;
	},

	addPlayer: function(id) {
		// Is the game full ?
		if( this.playerStack.length >= this.config.game.NB_PLAYER )
			return false;

		// Cannot join a started game
		if( this.state == this.config.gameStates.STARTED )
			return false;

		this.playerStack.push(id);

		if( this.playerStack.length >= this.config.game.NB_PLAYER )
			this.state = this.config.gameStates.READY;

		return true;
	},
};

exports.Game = Game;