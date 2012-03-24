Bot = function(character) {
	this.character = character;
	this.init();
}

Bot.prototype = {
	init: function() {
		// nothing yet
	},
	getNextDecision: function() {
		var timedDecision;

		// fill stack if needed
		if(this.character.decisionStack.length == 0) {
			this.takeNewDecision();
		}

		var timedDecision = this.character.decisionStack[0];
		timedDecision.duration--;


		// remove finished decision from the stack
		if(timedDecision.duration <= 0) {
			this.character.decisionStack.shift();
		}

		return timedDecision.decision;
	},
	addNewDecision: function() {
		var newDir   = this.character.randomDir();
		var newState = this.character.randomState();
		this.character.decisionStack.push({
			'decision' : new Decision(newState, newDir, null),
			'duration' : rand(100);
		});
	}
}