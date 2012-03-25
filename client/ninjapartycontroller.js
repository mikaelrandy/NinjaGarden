function NinjaPartyController(NinjaParty, messagePlaceHolder) {
	this.ninjaParty = NinjaParty;
	this.socket = null;
	this.messagePlaceHolder = messagePlaceHolder;
	this.showDebug = true;
	this.showFrequentDebug = false;

	ninjaPartyController = this ;

	this.messages = {
		'connect.awaiting' : "Range ton sabre, tu n'es toujours pas connecté...",
		'game.awaiting' : "Prépare ton sabre, on attend la partie...",
		'game.cannot_join' : "Ninja de pacotille, pas même capable de rejoindre la partie... <a href='' onclick='ctrl.resetGame()'>virer tout le monde d'ici pour prendre la place ?</a>",
		'game.start' : "Sors ton sabre ! maintenant !!!",
		'engine.start': "Les sabres ont été distribués, patience...",
		'game.ready': "Sabre au fourreau, tout le monde est prêt ?",
		'map.init': "On vient de vous donner un joli sabre, en attendant la suite",
		'game.end.win': "<b>Victoire !!<b> <a href=''>nouvelle partie ?</a>",
		'game.end.win.pillar': "<b>Victoire !!<b> Vous êtes passés par tous les piliers ! <a href=''>nouvelle partie ?</a>",
		'game.end.loose.pillar': "<b>Honte !!<b> Un autre a passé tous les piliers ! <a href=''>nouvelle partie ?</a>",
		'game.end.loose.killer': "<b>Honte !!<b> Vous êtes morts, morts et remorts ! <a href=''>nouvelle partie ?</a>",
		'game.end.win.killer': "<b>Victoire !!<b> Vous avez tué le dernier ninja caché ! <a href=''>nouvelle partie ?</a>",
		'game.reset': "Un ninja a subtilement remis à zéro la partie <a href=''>recommencer ?</a>",
		'game.end.loose': "<b>C'est mort pour vous, la partie est finie :(</b> <a href=''>nouvelle partie ?</a>",
		'game.end.timeout': "<b>C'est mort pour vous, le temps est écoulé :(</b> <a href=''>nouvelle partie ?</a>"
	} ;

	this.displayFeedback = function(message) {
		this.messagePlaceHolder.innerHTML = message ;
	}

	this.initGame = function (data) {
		var ninjaParty ;
		ninjaParty = this.ninjaParty = new NinjaParty() ;
		ninjaParty.mapHeight = data.config.maps.height ;
		ninjaParty.mapWidth = data.config.maps.width ;
		ninjaParty.setPlayer(data.config.player);
		ninjaParty.reallySendActionToServer = function (data) {
			ninjaPartyController.sendActionToServer(data) ;
		}
		ninjaParty.initEngine() ;
		//this.displayFeedback(this.messages['engine.start']) ;
		data.config.maps.pillars.forEach(function (p,i) {
			if (this.showDebug) console.log("Define pillar "+i+" with ",p) ;
			ninjaParty.setPillar(i, p);
		});
		this.initMapUpdate();
	}

	this.sendActionToServer = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT player.action", data) ;
		this.socket.emit('player.action', data);
	}

	this.initSocket = function(socket) {
		this.socket = socket ;
		socket.on('game.cannot_join', this.game__cannot_join) ;
		socket.on('game.awaiting', this.game__awaiting) ;
		socket.on('game.start', this.game__start) ;
		socket.on('game.ready', this.game__ready) ;
		socket.on('map.init', this.map__init) ;
		socket.on('game.end', this.game__end) ;
		socket.on('game.reset', this.game__reset) ;
		this.displayFeedback(this.messages['connect.awaiting']) ;
	}

	this.game__end = function (data) {
		var ninjaParty = ninjaPartyController.ninjaParty ;
		if (ninjaPartyController.showDebug) console.log("EVENT game.end", data) ;
		ninjaParty.endGame(data.end);	
		ninjaParty.loadServerFrame(data);
		if (ninjaParty.hasPlayerWin) {
			if (ninjaParty.isPillarWin) {
				ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.end.win.pillar']) ;	
			} else if (ninjaParty.isKillerWin) {
				ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.end.win.killer']) ;	
			} else {
				ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.end.win']) ;
			}
		}
		else {
			var msg = "" ;
			if (ninjaParty.nbAlivePlayers > 1) msg += "<br><small>Il restait "+(ninjaParty.nbAlivePlayers - 1)+" ninjas caché(s)</small>" ;
			msg += "<br><small>Vous aviez passé "+ninjaParty.player.stats.pillarValidated+" pilier(s)</small>" ;
			if (ninjaParty.isTimeout) {
				ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.end.timeout'] + msg) ;
			} else if (ninjaParty.isPillarWin) {
				ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.end.loose.pillar'] + msg) ;
			} else if (ninjaParty.isKillerWin) {
				ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.end.loose.killer'] + msg) ;
			} else {
				ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.end.loose'] + msg) ;
			}

		}
	}

	this.initMapUpdate = function() {
		this.socket.on('map.update', this.map__update) ;
	}

	this.map__init = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT map.init", data) ;
		ninjaPartyController.initGame(data);	
	}

	this.map__update = function (data) {
		if (ninjaPartyController.showFrequentDebug) console.log("EVENT game.update", data) ;
		ninjaPartyController.ninjaParty.loadServerFrame(data);
	}

	this.game__ready = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.ready", data) ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.ready']) ;
		ninjaPartyController.ninjaParty.prepareGame(data);
	}

	this.game__reset = function (data) {
		if (ninjaPartyController.showDebug) console.log("EVENT game.reset", data) ;
		ninjaPartyController.displayFeedback(ninjaPartyController.messages['game.reset']) ;
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
		ninjaParty.prepareCharactersForReset() ;
	}

	this.resetGame = function () {
		if (this.showDebug) console.log("SENDING EVENT game.reset") ;
		this.socket.emit('game.reset') ;
		ninjaParty.prepareCharactersForReset() ;
	}

	this.startGame = function(data) {
		var fakeFrame = buildRandomFrame(this.ninjaParty, 100) ;
		this.ninjaParty.initGame() ;
	}
	
}