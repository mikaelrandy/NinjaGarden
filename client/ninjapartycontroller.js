function NinjaPartyController(messagePlaceHolder) {
	this.ninjaParty ;
	this.socket = null;
	this.messagePlaceHolder = messagePlaceHolder;
	this.showDebug = true;

	ninjaPartyController = this ;

	this.messages = {
		'connect.awaiting' : "Range ton sabre, tu n'es toujours pas connecté...",
		'game.awaiting' : "Prépare ton sabre, on attend la partie...",
		'game.cannot_join' : "Ninja de pacotille, pas même capable de rejoindre la partie... <a href='#' onclick='ctrl.resetGame()'>vires tout le monde d'ici pour prendre la place</a> ou <a href=''>sors de la salle de reviens dicrètement</a>",
		'game.start' : "Sors ton sabre ! maintenant !!!",
		'engine.start': "Les sabres ont été distribués, patience..."
	} ;

	this.displayFeedback = function(message) {
		this.messagePlaceHolder.innerHTML = message ;
	}

	this.initGame = function (NinjaParty) {
		this.ninjaParty = new NinjaParty() ;
		this.ninjaParty.initEngine() ;
		this.displayFeedback(this.messages['engine.start']) ;
	}

	this.initSocket = function(socket) {
		this.socket = socket ;
		socket.on('game.cannot_join', this.game__cannot_join) ;
		socket.on('game.awaiting', this.game__awaiting) ;
		socket.on('game.start', this.game__start) ;
		this.displayFeedback(this.messages['connect.awaiting']) ;
	}

	this.game__cannot_join = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.cannot_join") ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.cannot_join']) ;
	}

	this.game__awaiting = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.awaiting") ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.awaiting']) ;
	}

	this.game__start = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.start") ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.start']) ;
		ninjaPartyController.startGame(data);
	}

	this.resetGame = function () {
		if (this.showDebug) console.log("SENDING EVENT game.reset") ;
		this.socket.emit('game.reset') ;
	}

	this.startGame = function(data) {
		var fakeFrame = buildRandomFrame(this.ninjaParty, 100) ;
		this.ninjaParty.initGame(fakeFrame) ;
	}
	
}