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
			if(ninja.type == 'player' && !ninja.character.canPlay()) {
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

			// game is over! (probably but not garentee for a winner)
			if(this.game.state == Config.GameStates.END) {
				return false;
			}
		}

		// checks pillars for real players that have moved
		//console.log(movedPlayers, pillar);
		for(var i=0; i < this.game.map.pillars.length; i++) {
			var pillar = this.game.map.pillars[i];
			var playersInArea = this.findNinjasNear(movedPlayers, pillar.x, pillar.y, Config.Dists.PILLAR_AREA);
		//console.log(movedPlayers, pillar);throw pillar;
			for(var j in playersInArea) {
				var player = playersInArea[j];
				if(player.character.stats.pillars.indexOf(pillar.id) == -1) {
					player.character.stats.pillars.push(pillar.id);
					player.character.addEvent(Config.Events.GET_PILLAR, {id: pillar.id});

					// we have a winner!
					if(player.character.stats.pillars.length == this.game.map.pillars.length) {
						player.character.addEvent(Config.Events.WIN);
						this.game.notifyWinner(player, false, true);
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
		ninja.character.state = 0;	// a l'arret

		var attackableNinjas = {};
		var ninjasInArea = this.findNinjasNear(this.ninjaStack, ninja.character.x, ninja.character.y, Config.Dists.ATTACKABLE);
		

//console.log(ninjasInArea, this.ninjaStack); throw a;

		// filter list so that only ninja in front of the curent player get attacked
		for(var i in ninjasInArea) {
			var characterInArea = ninjasInArea[i].character;
			// not the attacker...
			if(characterInArea.id != ninja.character.id) {
				// in good direction
				if(	   ((ninja.character.dir & Config.Compass.N) && characterInArea.y >= ninja.character.y)
					|| ((ninja.character.dir & Config.Compass.S) && characterInArea.y <= ninja.character.y)
					|| ((ninja.character.dir & Config.Compass.E) && characterInArea.x >= ninja.character.x)
					|| ((ninja.character.dir & Config.Compass.W) && characterInArea.x <= ninja.character.x) ) {
					attackableNinjas[i] = ninjasInArea[i];
				}
			}
		}
	
		for(var i in attackableNinjas) {
			var attackedNinja = attackableNinjas[i];

			if(attackedNinja.type == 'player') {
				attackedNinja.character.isDead(); 
				attackedNinja.character.addEvent(Config.Events.IS_DEAD);

				if(this.getAlivePlayers().length <= 1) {
					this.game.notifyWinner(ninja, true, false);
				}
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
		
		if(ninja.character.stats.smokesLeft > 0 && new Date().getTime() - ninja.character.stats.lastSmoke > Config.Times.DELAY_BETWEEN_SMOKE * 1000) {
			ninja.character.stats.smokesLeft--;
			ninja.character.stats.lastSmoke = new Date().getTime();
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
				found[ninja.character.id] = ninja; 
			}
		}

		return found;
	},

	getAlivePlayers: function() {
		var alivePlayers = [];
		for(var i=0; i < this.ninjaStack.length; i++) {
			var ninja = this.ninjaStack[i];
			if(ninja.type == 'player' && ninja.character.canPlay()) {
				alivePlayers.push(ninja);
			}
		}

		return alivePlayers;
	}
}


exports.Director = Director;