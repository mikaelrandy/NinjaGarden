function buildRandomFrame(ninjaParty, randomPlayersNumber) {
	randomPlayersNumber = randomPlayersNumber || 50 ;
	var players = [ ] ;
	var w = ninjaParty.mapWidth;
	var h = ninjaParty.mapHeight;
	var hchar = ninjaParty.playerHeight;
	var wchar = ninjaParty.playerWidth;

	for (i = 0 ; i < randomPlayersNumber ; i++) {
		players.push({
			x: Crafty.math.randomInt(1, w - wchar), 
			y: Crafty.math.randomInt(1, h - hchar), 
			dir: ninjaParty.getRandomDirection(),
			state: ninjaParty.States.MOVING 
		});
	}
	return frame = {
		players: players,
		timeLeft: 900,
		timeElapsed: 0,
		playerId: 0, 
	} ;
}