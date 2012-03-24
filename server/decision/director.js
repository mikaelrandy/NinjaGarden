// here ninja are either a bot or a player. both have a character entity
Director = function(game) {
	this.game = game;
	this.init();
}


Director.prototype = {
	init: function() {
		this.ninjaStack = this.game.ninjaStack;
	},

	// called by thegame manager
	processNewFrame: function() {
		var toProcess = [], movedPlayers = [];

		// sort the decisions based on their priority
		for(var i=0; i < this.ninjaStack.length; i++) {
			var ninja = this.ninjaStack[i];
			// do not process characters that can't move
			if(!ninja.character.canPlay()) {
				continue;
			}

			var current = {'ninja': ninja, 'decision': ninja.getNextDecision()};
			//console.log(current);
			if(current.decision.isEvent()) {
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
			//console.log(typeof(current.decision));
			if(typeof(current.decision) == 'object') {
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
					if(current.ninja.type == 'player') {
						movedPlayers.push(current.ninja);
					}
					break;
			}
		}

		// checks pillars for real players that have moved
		for(var i=0; i < this.game.map.pillars.length; i++) {
			var pillar = this.game.map.pillars[i];
			var playersInArea = this.findNinjasNear(movedPlayers, pillar.x, pillar.y, Config.Dists.PILLAR_AREA);
			for(var j in playersInArea) {
				var player = playersInArea[j];
				if(typeof(player.character.stats.pillars[pillar.id]) == 'undefined') {
					player.character.stats.pillars[pillar.id] = this.game.getCurrentTime();
					player.character.addEvent(Config.Events.GET_PILLAR);

					var nbFoundPillar = 0;
					for(var k in player.character.stats.pillars) {
						nbFoundPillar++;
					}

					if(nbFoundPillar == this.game.map.pillars.length) {
						player.character.addEvent(Config.Events.WIN);
						this.game.notifyWinner(player);
					}
				}
			}
		}
	},

	// compute new position from the character
	computeNextPosition: function(ninja, decision) {
		// update character with last decision and make him move
		ninja.character.continueMove();
	},

	// compute the result of an attack
	computeAttackAction: function(ninja, decision) {

		ninja.character.addEvent(Config.Events.ATTACK);
		ninja.character.state = null;	// a l'arret

		var attackableNinjas = {};
		var ninjasInArea = this.findNinjasNear(this.ninjaStack, ninja.character.x, ninja.character.y, Config.Dists.ATTACKABLE);
		
		// filter list so that only ninja in front of the curent player get attacked
		for(var i in ninjasInArea) {
			var characterInArea = ninjasInArea[i].character;
			if(	   ((ninja.character.dir & Config.Compass.N) && characterInArea.y >= ninja.character.y)
				|| ((ninja.character.dir & Config.Compass.S) && characterInArea.y <= ninja.character.y)
				|| ((ninja.character.dir & Config.Compass.E) && characterInArea.x >= ninja.character.x)
				|| ((ninja.character.dir & Config.Compass.W) && characterInArea.x <= ninja.character.x) ) {
				attackableNinjas[i] = ninjasInArea[i];
			}
		}
	
		for(var i in attackableNinjas) {
			var attackedNinja = attackableNinjas[i];

			if(attackedNinja.type == 'player') {
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
		ninja.character.state = null;	// a l'arret
		
		if(ninja.character.stats.smokesLeft > 0) {
			ninja.character.stats.smokesLeft--;
			ninja.character.addEvent(Config.Events.SMOKE);
		}
	},

	// find ninja arround the given point
	// return array
	findNinjasNear: function(ninjaStack, x, y, maxDist) {
		var found = {}, cmpMaxDist = maxDist * maxDist;
		for(var i=0; i < ninjaStack.length; i++) {
			var ninja = ninjaStack[i],
				diffX = ninja.character.x - x,
				diffY = ninja.character.y - y;
			if(ninja.character.canPlay() && diffX * diffX + diffY * diffY <= cmpMaxDist) {
				found[minja.id] = ninja; 
			}
		}

		return found;
	}
}


exports.Director = Director;