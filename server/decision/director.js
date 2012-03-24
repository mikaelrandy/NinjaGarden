// here ninja are either a bot or a player. both have a character entity
Director = function(game) {
	this.game = game;
}


Director.prototype = {
	// called by thegame manager
	processNewFrame: function() {
		var toProcess;
		// sort the decisions based on their priority
		for(var id in game.ninjaStack) {
			var current = {'ninja': game.ninjaStack[id], 'decision': ninja.getNextDecision()};
			if(decision.isEvent()) {
				toProcess.push(current);
			} else {
				toProcess.unshift(current);
			}
		}


		// process ALL the stuff...
		while(current = toProcess.shift()) {
			switch(decision.evt) {
				case Config.Events.ATTACK:
					this.computeAttackAction(current.ninja, current.decision);
					break;
				case Config.Events.SMOKE:
					this.computeSmokeAction(current.ninja, current.decision);
					break;
				default:
					this.computeNextPosition(current.ninja, current.decision);
					break;
			}
		}
	},

	// compute new position from the character
	computeNextPosition: function(ninja, decision) {


	},

	// compute the result of an attack
	computeAttackAction: function(ninja, decision) {
		var attackableNinjas = this.findNinjasNear(ninja.character.x, ninja.character.y, Config.Dists.ATTACKABLE);
	},

	// compute the result of a smoke
	// it just stop the player and add an event on it
	computeSmokeAction: function(ninja, decision) {
		ninja.character.addEvent(Config.Events.SMOKE, ninja.character.x, ninja.character.y);
		ninja.character.state = null;	// a l'arret
	},

	// find neareast
	findNinjasNear: function(x, y, dist) {
		for(var id in game.ninjaStack) {
			var ninja = game.ninjaStack[id];
		}
	}
}
