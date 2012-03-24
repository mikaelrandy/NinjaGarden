// here ninja are either a bot or a player. both have a character entity
Director = function(game) {
	this.game = game;
	this.nbPillar = 0;
	for(var i in this.game.map.pillars) {
		this.nbPillar++;
	}
}


Director.prototype = {
	// called by thegame manager
	processNewFrame: function() {
		var toProcess, movedPlayers = [];
		// sort the decisions based on their priority
		for(var id in this.game.ninjaStack) {
			// do not process characters that can't move
			if(!this.game.ninjaStack[id].character.canPlay()) {
				continue;
			}

			var current = {'ninja': this.game.ninjaStack[id], 'decision': ninja.getNextDecision()};
			if(decision.isEvent()) {
				toProcess.push(current);
			} else {
				toProcess.unshift(current);
			}
		}


		// process the decisions...
		while(current = toProcess.shift()) {
			// can occurs here if the character just get shoot
			if(!current.ninja.character.canPlay()) {
				continue;
			}

			// update char with basic info of the decision
			if(typeof(current.decision) == 'Decision') {
				current.ninja.character.dir = current.decision.dir;
				current.ninja.character.state = current.decision.state;
			}

			switch(current.decision.evt) {
				case Config.Events.ATTACK:
					this.computeAttackAction(current.ninja, current.decision);
					break;
				case Config.Events.SMOKE:
					this.computeSmokeAction(current.ninja, current.decision);
					break;
				default:
					this.computeNextPosition(current.ninja, current.decision);
					// list players that have moved
					if(typeof(current.ninja) == 'Player') {
						movedPlayers.push(current.ninja);
					}
					break;
			}
		}

		// checks pillars for real players that have moved
		for(var i in game.map.pillars) {
			var pillar = game.map.pillars[i];
			var playersInArea = this.findNinjasNear(movedPlayers, pillar.x, pillar.y, Config.Dists.PILLAR_AREA);
			for(var j in playersInArea) {
				var player = playersInArea[j];
				if(typeof(player.characters.stats.pillars[pillar.id]) == 'undefined') {
					player.characters.stats.pillars[pillar.id] = this.game.currentTime;
					player.character.addEvent(Config.Events.GET_PILLAR);

					var nbFoundPillar = 0;
					for(var k in player.character.stats.pillars) {
						nbFoundPillar++;
					}

					if(nbFoundPillar == this.nbPillar) {
						player.character.addEvent(Config.Events.WIN);
						// TODO: other notification
						// this.game.notifyWinner(player);
					}
				}
			}
		}
	},

	// compute new position from the character
	computeNextPosition: function(ninja, decision) {
		// update character with last decsiion and make him move
		ninja.character.continueMove();
	},

	// compute the result of an attack
	computeAttackAction: function(ninja, decision) {

		ninja.character.addEvent(Config.Events.ATTACK);
		ninja.character.state = null;	// a l'arret

		var attackableNinjas = this.findNinjasNear(this.game.ninjaStack, ninja.character.x, ninja.character.y, Config.Dists.ATTACKABLE);
		// TODO: filter list so that only ninja in front of the curent player get attacked
	
		for(var i in attackableNinjas) {
			var attackedNinja = attackableNinjas[i];
			// TODO: usefull? 
			//attackedNinja.addEvent(Config.Events.ATTACKED);
			if(typeof(attackedNinja) == 'Player') {
				attackedNinja.character.isDead(); 
				attackedNinja.character.addEvent(Config.Events.IS_DEAD);

			} else {
				attackedNinja.character.isStunned(); 
				attackedNinja.character.addEvent(Config.Events.IS_STUNNED);
			}
		}
	},

	// compute the result of a smoke
	// it just stop the player and add an event on it
	computeSmokeAction: function(ninja, decision) {
		ninja.character.addEvent(Config.Events.SMOKE);
		ninja.character.state = null;	// a l'arret
	},

	// find ninja arround the given point
	// return array
	findNinjasNear: function(ninjaStack, x, y, maxDist) {
		var found = {}, cmpMaxDist = maxDist * maxDist;
		for(var i in ninjaStack) {
			var ninja = ninjaStack[i],
				diffX = ninja.character.x - x,
				diffY = ninja.character.y - y;
			if(ninja.character.canMove() && diffX * diffX + diffY * diffY <= cmpMaxDist) {
				found[minja.id] = ninja; 
			}
		}

		return found;
	}
}
