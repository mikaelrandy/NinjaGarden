function NinjaPartyController(NinjaParty, messagePlaceHolder) {
	this.ninjaParty = NinjaParty;
	this.socket = null;
	this.messagePlaceHolder = messagePlaceHolder;
	this.showDebug = true;

	ninjaPartyController = this ;

	this.messages = {
		'connect.awaiting' : "Range ton sabre, tu n'es toujours pas connecté...",
		'game.awaiting' : "Prépare ton sabre, on attend la partie...",
		'game.cannot_join' : "Ninja de pacotille, pas même capable de rejoindre la partie... <a href='#' onclick='ctrl.resetGame()'>vires tout le monde d'ici pour prendre la place</a> ou <a href=''>sors de la salle de reviens dicrètement</a>",
		'game.start' : "Sors ton sabre ! maintenant !!!",
		'engine.start': "Les sabres ont été distribués, patience...",
		'game.ready': "Sabre au fourreau, tout le monde est prêt ?",
		'map.init': "On vient de vous donner un joli sabre, en attendant la suite"
	} ;

	this.displayFeedback = function(message) {
		this.messagePlaceHolder.innerHTML = message ;
	}

	this.initGame = function (data) {
		this.ninjaParty = new NinjaParty() ;
		this.ninjaParty.mapHeight = data.config.maps.height ;
		this.ninjaParty.mapWidth = data.config.maps.width ;
		this.ninjaParty.sendActionToServer = function (data) {
			ninjaPartyController.sendActionToServer(action, data) ;
		}
		this.ninjaParty.initEngine() ;
		this.displayFeedback(this.messages['engine.start']) ;
		this.initMapUpdate();
	}

	this.sendActionToServer = function (data) {

	}

	this.initSocket = function(socket) {
		this.socket = socket ;
		socket.on('game.cannot_join', this.game__cannot_join) ;
		socket.on('game.awaiting', this.game__awaiting) ;
		socket.on('game.start', this.game__start) ;
		socket.on('game.ready', this.game__ready) ;
		socket.on('map.init', this.map__init) ;
		this.displayFeedback(this.messages['connect.awaiting']) ;
	}

	this.initMapUpdate = function() {
		this.socket.on('map.update', this.map__update) ;
	}

	this.map__init = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT map.init", data) ;
		ninjaPartyController.initGame(data);	
	}

	this.map__update = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.update", data) ;
		ninjaPartyController.ninjaParty.loadServerFrame(data);
	}

	this.game__ready = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.ready", data) ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.ready']) ;
		ninjaPartyController.ninjaParty.prepareGame(data);
	}

	this.game__cannot_join = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.cannot_join", data) ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.cannot_join']) ;
	}

	this.game__awaiting = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.awaiting", data) ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.awaiting']) ;
	}

	this.game__start = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.start", data) ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.start']) ;
		ninjaPartyController.startGame(data);
	}

	this.resetGame = function () {
		if (this.showDebug) console.log("SENDING EVENT game.reset") ;
		this.socket.emit('game.reset') ;
	}

	this.startGame = function(data) {
		var fakeFrame = buildRandomFrame(this.ninjaParty, 100) ;
		this.ninjaParty.initGame() ;
	}
	
}