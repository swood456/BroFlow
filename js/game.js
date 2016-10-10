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
	
	var player, dragMagnitude, boatSpeed, slowDist = 200,
		scrollSpeed;

	var invulnerable = false, invulTween;
	
	var items, rocks, bros, powerups;

	/*
	//enemyTestCode
	var enemy;
	*/

	var score, labelScore, health, labelHealth, healthPos = [
			[  0,  15], // 1
			[-20, -26], // 2
			[-40, -10], // 3
			[-60,  40], // 4
			[ 50, -20], // 5
			[ 50, -20], // 6
		],
		currentLevel;

	var world, bgWalls, water,
		bgKeys = ['bg1', 'bg2', 'bg3',
		          'bg4', 'bg5', 'bg6',
		          'bg7', 'bg8', 'bg9'];

	var BGMusic, goodSound, badSound;

	function preload () {
		
		game.load.path = 'assets/sprites/';

		//load images
		game.load.image ('player', 'mattress.png')
		         .images(bgKeys)
		         .image ('bricks', 'bricks.png')
		         .image ('boulder', 'boulder.png')
		         .image ('item', 'star.png')
		         .image ('bro', 'einstein.png')
		         .image ('pickup1', 'pickup1.png')
		         .image ('pickup2', 'pickup2.png')
		         .image ('pickup3', 'pickup3.png')
		         .image ('water', 'water 1.png')
		         .image ('powerup', 'soda bottle2.png')
		         .spritesheet ('dude', 'dude.png', 32, 48);

		/*
		//enemyTestCode
		game.load.image ('enemy', 'enemy.png');
		*/

		//Load in Sound effects and BG Music
		game.load.path = 'assets/sounds/';

		game.load.audio ('backgroundMusic', 'StockBGMusic.mp3')
				 .audio ('goodSound', 'chimeSound.wav')
				 .audio ('badSound', 'WaterSplash2.wav')
	}

	function create () {
		game.time.advancedTiming = true;
		//load arcade physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//game.stage.backgroundColor = '#0072bc';
		water = game.add.tileSprite(0, 0, game.width, game.height, 'water');
		
		world    = game.add.group();
		bgWalls  = new BGWalls(game, world, bgKeys);
		items    = new Spawner(game, world, ['pickup1'], 6000, 10000, bgWalls.minHeight);
		rocks    = new Spawner(game, world, ['boulder', 'bricks'], 1800, 2000, bgWalls.minHeight);
		bros     = new Spawner(game, world, ['bro'], 5000, 9000, bgWalls.minHeight);
		powerups = new Spawner(game, world, ['powerup'], 10000, 15000, bgWalls.minHeight);

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
		player.body.setSize(164, 85, 33, 3);
		player.anchor.setTo(0.5,0.5);
		player.body.collideWorldBounds = true;

		player.body.drag.x = Math.sqrt(2) * dragMagnitude;
		player.body.drag.y = Math.sqrt(2) * dragMagnitude;

		/*
		//enemyTestCode
		enemy = game.add.sprite(600,400, 'enemy');
		game.physics.enable(enemy, Phaser.Physics.ARCADE);
		enemy.anchor.setTo(0.5,0.5);
		enemy.body.collideWorldBounds = true;
	

		enemy.body.drag.x = Math.sqrt(2) * dragMagnitude;
		enemy.body.drag.y = Math.sqrt(2) * dragMagnitude;
		*/

		//score label
		var style = {font: "32px Arial", fill: "#500050", align: "center"};
		var text = score;
		game.add.text (100, 600, "Score:", style);
		labelScore = game.add.text (200, 600, text, style);
		text = health;
		
		labelHealth = game.add.text (100, 650, text, style);

		currentLevel = 1;
		scrollSpeed = 5;
		dragMagnitude = 500;
		boatSpeed = 500;
		invulnerable = false;

		//Add Sound and Music Vars to scene
		BGMusic = game.add.audio('backgroundMusic');
		goodSound = game.add.audio('goodSound');
		badSound = game.add.audio('badSound');

		//BGMusic.play();
		BGMusic.loopFull(0.6); //Loops BG music at 60% Volume
		BGMusic.onLoop.add(hasLooped, this); //Debug function. "hasLooped" should output a console.log() message when called on a loop
		
		//set game life and score
		invulnerable = false;
		health = score = 0;
		setHealth(1, true);
	}


	function update() {
		
		if (player.top < bgWalls.minHeight) {
			player.top = bgWalls.minHeight;
			player.body.velocity.y = 0;
		}

		if(currentLevel === 2 && scrollSpeed < 7){
			scrollSpeed += 0.1;
		} else if(currentLevel === 3 && scrollSpeed < 9){
			scrollSpeed += 0.1;
		}
		
		world.x -= scrollSpeed;
		water.tilePosition.x -= scrollSpeed*0.9;
		//scrollSpeed = Math.min(scrollSpeed * 1.0001, 50);
		bgWalls.update();
		items.update();
		rocks.update();
		bros.update();
		powerups.update();
		
		if(health > 0 && game.input.activePointer.leftButton.isDown) {
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




		//collectable code
		//collisions
		if (health > 0) {
			game.physics.arcade.overlap(player, items.group, collectItem, null, this);
			game.physics.arcade.overlap(player, bros.group, broPickup, null, this);
			game.physics.arcade.overlap(player, rocks.group, rockHit, null, this);
			game.physics.arcade.overlap(player, powerups.group, powerupHit, null, this);
		}

		/*
		//enemyTestCode
		game.physics.arcade.collide (player, enemy);
		game.physics.arcade.moveToObject(enemy, player, 10, 2000);
		*/



		//update score
		labelScore.text = score + " fps: " + game.time.fps;
	}
	
	function setHealth(h, noEffect, noInvul) {
		console.log("bros len: " + player.bros.length);
		if (h > player.bros.length) {
			h = player.bros.length;
		} else if (h <= 0) {
			h = 0;
			game.camera.fade('#000000', 1000, false);
			game.camera.onFadeComplete.add(function(){
				game.state.start("gameOver"); //Go to gameOver state if out of health
			}, this);
		}
		
		if (noEffect) {
			// No effect, dummy
		} else if (h > health) {
			goodSound.play();
		} else if (h < health) {
			badSound.play();
			
			// Tint the raft red
			var tintObj = {color: 0x00};
			game.add.tween(tintObj).to({color: 0xFF}, 500, "Linear", true)
				.onUpdateCallback(function(){
					player.tint = 0xFF0000 | tintObj.color << 8 | tintObj.color;
				}).onComplete.add(function(){
					player.tint = 0xFFFFFF;
					// TODO: Fix for speed tint
				});
			
			if (!noInvul) setInvulnerable(1000);
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

		//change levels
		if(score >= 5 && currentLevel === 1){
			console.log("move to level 2");

			//move to level 2
			currentLevel = 2;

			//change object that is spawned
			items.keys = ['pickup2'];

			//change spawner properties
			items.minInt = 7000;
			items.maxInt = 10500;
			rocks.minInt = 1700;
			rocks.maxInt = 1950;
			bros.minInt = 5500;
			bros.maxInt = 9500;
			powerups.minInt = 9500;
			powerups.maxInt = 14500;

		} else if(score >= 10 && currentLevel === 2){
			console.log("move to level 3");
			//move to level 2
			currentLevel = 3;

			//change object that is spawned
			items.keys = ['pickup3'];

		}

		else if(score >= 15 && currentLevel == 3){ //For now, Level 3 is the highest we go
			console.log("Last Level done");

			//Make Callback to final screen.
			game.state.start("victory"); //Go to victory screen
			
		}
	}

	function broPickup(thisPlayer, thisBro){
		thisBro.kill();
		setHealth(health + 1);
	}

	function rockHit(thisPlayer, thisRock){
		if(!invulnerable){
			//thisRock.kill();
			//invulnerable = true;

			setHealth(health - 1);
		}
	}

	function powerupHit(thisplayer, thisPowerup){
		thisPowerup.kill();

		//temporarily make speed faster and invulnerable
		boatSpeed = 1000;
		// TODO: Speed tint
		setInvulnerable(5000);

		game.time.events.add(Phaser.Timer.SECOND * 5, slowDown, this);

	}

	function slowDown(){
		boatSpeed = 500;
	}
	
	function setInvulnerable(time) {
		if (time === 0) {
			invulnerable = false;
			invulTween.stop();
			player.alpha = 1;
			return;
		}
		time = time || 1000;
		
		if (!invulTween || invulTween.totalDuration < time) {
			invulnerable = true;
			if(invulTween) {
				invulTween.stop();
				player.alpha = 1;
			}
			
			invulTween = game.add.tween(player).from({alpha: 0.5},
				200, "Linear", true, 0, time / 200, true);
			invulTween.onComplete.add(makeVulnerable);
		}
	}

	function makeVulnerable(){
		invulnerable = false;
	}

	//State for the GameOver screen
	var GameOver = function(game) {
		console.log("Starting Game Over state");
	}
	GameOver.prototype = {
		preload: function(){
			game.load.path = 'assets/sprites/';
			//Will Load a Game Over screen asset when said asset is available
			//For now, use blank Title Screen again as placeholder
			game.load.image('title', 'title.png');
		},

		create: function(){
			var GOimage = game.add.sprite(game.world.centerX, game.world.centerY, 'title');

    		//  Moves the image anchor to the middle, so it centers inside the game properly
    		GOimage.anchor.set(0.5);

    		//  Enables all kind of input actions on this image (click, etc)
    		GOimage.inputEnabled = true;

    		GOtext = game.add.text(250, 16, '', { fill: '#ffffff' });

    		GOimage.events.onInputDown.add(RestartGame, this);

			//create a text object
			var GOtext = game.add.text(100,100,"Game Over!", {font: "bold 32px Arial", fill: "#fff"});

			BGMusic.stop();
		}
	}
	
	function RestartGame() {
		//For this callback, return to the menu/title screen
		this.game.state.start("menu");
	}

	//State for the Victory screen
	var Victory = function(game) {
		console.log("Starting Victory state");
	}
	Victory.prototype = {
		preload: function(){
			game.load.path = 'assets/sprites/';
			//Will Load a Game Over screen asset when said asset is available
			//For now, use blank Title Screen again as placeholder
			game.load.image('title', 'title.png');
		},

		create: function(){
			var VicImage = game.add.sprite(game.world.centerX, game.world.centerY, 'title');

    		//  Moves the image anchor to the middle, so it centers inside the game properly
    		VicImage.anchor.set(0.5);

    		//  Enables all kind of input actions on this image (click, etc)
    		VicImage.inputEnabled = true;

    		VicText = game.add.text(250, 16, '', { fill: '#ffffff' });

    		VicImage.events.onInputDown.add(RestartGame, this);

			//create a text object
			var VicText = game.add.text(100,100,"You Win!", {font: "bold 32px Arial", fill: "#fff"});
		}
	}
	
	
	game.state.add("menu", menu);
	game.state.add("gameplay", gameplay);
	game.state.add("gameOver", GameOver);
	game.state.add("victory", Victory);

	game.state.start("menu");

	//Fucntion to test that background music is looping. Mainly debugging function right now.
	function hasLooped(sound) {

    	console.log("Song looping");

	}
};