// here ninja are either a bot or a player. both have a character entity
Director = function(ninjas) {
	this.ninjas = ninjas;
}


Director.prototype = {
	processNewFrame: function() {
		var toProcess;
		// sort the decisions based on their priority
		for(var id in this.ninjas) {
			var current = {'ninja': this.ninjas[id], 'decision': ninja.getNextDecision()};
			if(decision.evt == undefined) {
				toProcess.push(current);
			} else {
				toProcess.unshift(current);
			}
		}


		// process ALL the stuff...
		while(current = toProcess.shift()) {
			
		}
	}
}