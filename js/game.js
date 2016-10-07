var screenToWorldX, worldToScreenX;

window.onload = function() {
	
	screenToWorldX = function(x) {
		return x - world.x;
	}
	
	worldToScreenX = function(x) {
		return x + world.x;
	}

	var game = new Phaser.Game(1334, 750, Phaser.AUTO, '');

	var menu = function(game){
		console.log("starting menu");
	}
	menu.prototype = {
		preload: function(){
			game.load.path = 'assets/sprites/';
			//load a title image
			game.load.image('title', 'title.png');
		},

		create: function(){
			var image = game.add.sprite(game.world.centerX, game.world.centerY, 'title');

    		//  Moves the image anchor to the middle, so it centers inside the game properly
    		image.anchor.set(0.5);

    		//  Enables all kind of input actions on this image (click, etc)
    		image.inputEnabled = true;

    		text = game.add.text(250, 16, '', { fill: '#ffffff' });

    		image.events.onInputDown.add(listener, this);

			//create a text object
			var text = game.add.text(100,100,"SAVE THE DUDEBROS", {font: "bold 32px Arial", fill: "#fff"});

			

		}		
	}

	function listener(){
		//make a callback to go to the game state when finished
		this.game.state.start("gameplay");
	}

	var gameplay = function(game){
		console.log("starting game");
	}

	gameplay.prototype ={
		preload: preload,
		create: create,
		update: update
	}
	
	var player, dragMagnitude = 500, boatSpeed = 500, slowDist = 200,
		scrollSpeed = 5;
	
	var items, rocks, bros;

	var score, labelScore, health, labelHealth, healthPos = [
			[  0,  15], // 1
			[-20, -26], // 2
			[-40, -10], // 3
			[-60,  40], // 4
			[ 50, -20], // 5
			[ 50, -20], // 6
			[ 50, -20]  // 7
		],
		currentLevel;
	
	var world, bgWalls,
		bgKeys = ['bg1', 'bg2', 'bg3',
		          'bg4', 'bg5', 'bg6',
		          'bg7', 'bg8', 'bg9'];

	var BGMusic, goodSound, badSound;

	function preload () {
		
		game.load.path = 'assets/sprites/';

		//load images
		game.load.image ('player', 'player.png')
		         .images(bgKeys)
		         .image ('rock', 'bullet.png')
		         .image ('item', 'star.png')
		         .image ('bro', 'einstein.png')
		         .image ('pickup1', 'pickup1.png')
		         .image ('pickup2', 'pickup2.png')
		         .image ('pickup3', 'pickup3.png')
		         .spritesheet ('dude', 'dude.png', 32, 48);

		//Load in Sound effects and BG Music
		game.load.path = 'assets/sounds/';

		game.load.audio ('backgroundMusic', 'StockBGMusic.mp3')
				 .audio ('goodSound', 'chimeSound.wav')
				 .audio ('badSound', 'boingSound.wav');
	}

	function create () {
		game.time.advancedTiming = true;
		//load arcade physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		game.stage.backgroundColor = '#0072bc';
		
		world   = game.add.group();
		bgWalls = new BGWalls(game, world, bgKeys);
		items   = new Spawner(game, world, ['pickup1'], 20, 1000, bgWalls.minHeight);
		rocks	= new Spawner(game, world, ['rock'], 20, 1000, bgWalls.minHeight);
		bros 	= new Spawner(game, world, ['bro'], 3000, 5000, bgWalls.minHeight);

		//make a player thing
		player = game.add.sprite(200,200, 'player');
		player.bros = [];
		for (var i = 0; i < healthPos.length; i++) {
			var pos = healthPos[i],
				bro = player.addChild(game.make.sprite(pos[0], pos[1], 'dude'));
			player.bros.push(bro);
			bro.anchor.set(0.5, 1);
			bro.kill();
		}

		game.physics.enable(player, Phaser.Physics.ARCADE);
		
		player.anchor.setTo(0.5,0.5);

		player.body.collideWorldBounds = true;

		player.body.drag.x = Math.sqrt(2) * dragMagnitude;
		player.body.drag.y = Math.sqrt(2) * dragMagnitude;

		//score label
		var style = {font: "32px Arial", fill: "#500050", align: "center"};
		var text = score;
		game.add.text (100, 600, "Score:", style);
		labelScore = game.add.text (200, 600, text, style);
		text = health;
		//game.add.text (100, 650, "Health:", style);
		labelHealth = game.add.text (100, 650, text, style);

		currentLevel = 1;
		scrollSpeed  = 5;

		//Add Sound and Music Vars to scene
		BGMusic = game.add.audio('backgroundMusic');
		goodSound = game.add.audio('goodSound');
		badSound = game.add.audio('badSound');

		//BGMusic.play();
		BGMusic.loopFull(0.6); //Loops BG music at 60% Volume
		BGMusic.onLoop.add(hasLooped, this); //Debug function. "hasLooped" should output a console.log() message when called on a loop
		
		//set game life and score
		health = score = 0;
		setHealth(1, true);
	}


	function update() {
		
		if (player.top < bgWalls.minHeight) {
			player.top = bgWalls.minHeight;
			player.body.velocity.y = 0;
		}
		
		world.x -= scrollSpeed;
		//scrollSpeed = Math.min(scrollSpeed * 1.0001, 50);
		bgWalls.update();
		items.update();
		rocks.update();
		bros.update();
		
		if(game.input.activePointer.leftButton.isDown) {
			//move player towards mouse button
			game.physics.arcade.moveToPointer(player,
				game.math.bezierInterpolation(
					[0, boatSpeed],
					Math.max(0, Math.min(1, // Constrain to range [0, 1]
						game.physics.arcade.distanceToPointer(player) / slowDist
					))
				)
			);
			
		}
		var velocityMagnitude = player.body.velocity.getMagnitude();
		player.body.drag.x = Math.abs(player.body.velocity.x / velocityMagnitude * dragMagnitude);
		player.body.drag.y = Math.abs(player.body.velocity.y / velocityMagnitude * dragMagnitude);

		if(score > 5 && currentLevel == 1){
			console.log("move to level 2");
			//move to level 2
			currentLevel = 2;

			//change object that is spawned
			items.keys = ['pickup2'];

			//change the scroll speed
			scrollSpeed = 7;
		} else if(score > 10 && currentLevel == 2){
			console.log("move to level 3");
			//move to level 2
			currentLevel = 3;

			//change object that is spawned
			items.keys = ['pickup3'];

			//change the scroll speed
			scrollSpeed = 9;
		}

		//collectable code
		//collisions
		game.physics.arcade.overlap(player, items.group, collectItem, null, this);
		game.physics.arcade.overlap(player, bros.group, broPickup, null, this);
		game.physics.arcade.overlap(player, rocks.group, rockHit, null, this);

		//update score
		labelScore.text = score + " fps: " + game.time.fps;
	}
	
	function setHealth(h, noSound) {
		if (h > player.bros.length) {
			h = player.bros.length;
		} else if (h <= 0) {
			h = 0;
			game.camera.fade('#000000', 1000, false);
			game.camera.onFadeComplete.add(function(){
				game.state.start("menu");
			}, this);
		}
		
		if (noSound) {
			// No sound, dummy
		} else if (h > health) {
			goodSound.play();
		} else if (h < health) {
			badSound.play();
		}
		
		while (h > health) {
			player.bros[health++].revive();
		}
		while (h < health) {
			player.bros[--health].kill();
		}
		
		labelHealth.text = "Health: " + health;
	}

	function collectItem(thisPlayer, thisItem){
		thisItem.kill();
		score += 1;
	}

	function broPickup(thisPlayer, thisBro){
		thisBro.kill();
		setHealth(health + 1);
	}

	function rockHit(thisPlayer, thisRock){
		thisRock.kill();
		setHealth(health - 1);
	}

	game.state.add("menu", menu);
	game.state.add("gameplay", gameplay);
	game.state.start("menu");

	//Fucntion to test that background music is looping. Mainly debugging function right now.
	function hasLooped(sound) {

    	console.log("Song looping");

	}
};