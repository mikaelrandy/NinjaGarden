Player = function(character, socketid) {
	this.character = character;
	this.socketid = socketid;
	this.init();
}

Player.prototype = {
	init: function() {
	},
	// either a player has at least one pending decision either it does nothing new
	getNextDecision: function() {
		var timedDecision;

		// stack empty = repeat last movement
		if(this.character.decisionStack.length == 0) {
			return new Decision(this.character.state, this.character.dir);
		}

		var timedDecision = this.character.decisionStack[0];
		timedDecision.duration--;
		// remove finished decision from the stack
		if(timedDecision.duration <= 0) {
			this.character.decisionStack.shift();
		}

		return timedDecision.decision;
	},
	addNewDecision: function(decision) {
		var newDecisionEntry = {
			'decision' : decision,
			'duration' : 1
		}

		if(decision.isEvent()) {
			this.character.decisionStack.push(newDecisionEntry);
		} else {
			this.character.decisionStack([newDecisionEntry]);
		}
	}
}

exports.Player = Player;
