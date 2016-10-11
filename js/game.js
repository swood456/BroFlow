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
	
	var player, dragMagnitude, boatSpeed, speedMult, slowDist = 200,
		scrollSpeed;

	var invulnerable = false, invulTween;
	
	var items, rocks, bros, powerups;

	/*
	//enemyTestCode
	var enemy;
	*/

	var score, labelScore, health, labelHealth, healthPos = [
			[-10,  100], // 1
			[-47, -22], // 2
			[-8, -20], // 3
			[50,  0], // 4
			[ 70, -20], // 5
			[ 30, -10] // 6
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
		         .image ('broLife2', 'bropickup2.png')
		         .image ('broLife3', 'bropickup3.png')
		         .image ('broLife4', 'bropickup4.png')
		         .image ('broLife5', 'bropickup5.png')
		         .image ('broLife6', 'bropickup6.png')
		         .image ('pickup1', 'pickup1.png')
		         .image ('pickup2', 'pickup2.png')
		         .image ('pickup3', 'pickup3.png')
		         .image ('water', 'water 1.png')
		         .image ('powerup', 'soda bottle 2.png')
		         .spritesheet ('dude', 'dude.png', 32, 48)
		         .spritesheet ('dudebro1', 'dudebro_PaddleSpriteSheet_12fps_120pixelsWide.png', 120, 140)
		         .spritesheet ('dudebro2', 'Swag_fistPump_highFive_7fps_40pixelsWide.png', 40, 75)
		         .spritesheet ('dudebro3', 'Yolo_fistPump_highFive_40pixelsWide.png', 40, 80)
		         .spritesheet ('dudebro4', 'Stripes_animation_10fps_42pixelswide.png', 42, 85)
		         .spritesheet ('dudebro5', 'Green_SpriteSheet_10fps_42pixelsWide.png', 42, 74)
		         .spritesheet ('dudebro6', 'Pink_SpriteSheet_10fps_42pixelswide.png', 42, 74);

		/*
		//enemyTestCode
		game.load.image ('enemy', 'enemy.png');
		*/

		//Load in Sound effects and BG Music
		game.load.path = 'assets/sounds/';

		game.load.audio ('backgroundMusic', 'StockBGMusic.mp3') //BG Music from http://www.orangefreesounds.com/electro-punk-action-background-music/, permitted for non-commercial use
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
<<<<<<< HEAD
		items    = new Spawner(game, world, ['pickup1'], 600, 1000, bgWalls.minHeight, game.height - (game.cache.getImage('pickup1').height / 2) );
		rocks    = new Spawner(game, world, ['boulder', 'bricks'], 1800, 2000, bgWalls.minHeight, game.height - (game.cache.getImage('boulder').height / 2) );
		bros     = new Spawner(game, world, ['bro'], 500, 900, bgWalls.minHeight, game.height - (game.cache.getImage('bro').height / 2) );
		powerups = new Spawner(game, world, ['powerup'], 1500, 2000, bgWalls.minHeight, game.height - (game.cache.getImage('powerup').height / 2) );
=======
		items    = new Spawner(game, world, ['pickup1'], 6000, 10000, bgWalls.minHeight, game.height - (game.cache.getImage('pickup1').height / 2));
		rocks    = new Spawner(game, world, ['boulder', 'bricks'], 1800, 2000, bgWalls.minHeight, game.height - (game.cache.getImage('boulder').height / 2));
		bros     = new Spawner(game, world, ['broLife2'], 5000, 9000, bgWalls.minHeight, game.height - (game.cache.getImage('bro').height / 2));
		powerups = new Spawner(game, world, ['powerup'], 15000, 20000, bgWalls.minHeight, game.height - (game.cache.getImage('powerup').height / 2));


>>>>>>> origin/development

		//make a player thing
		player = game.add.sprite(200,200, 'player');
		player.bros = [];
		
		//load the bros into the game
		var pos, broSprite;

		//bro 3
		pos = healthPos[2];
		broSprite = game.make.sprite(pos[0], pos[1], 'dudebro3');
		broSprite.animations.add('idle', [0,1,2,3,4,5,6], 12, true);
		broSprite.animations.add('highfive', [7,8,9,10,11,12,13,14], 7, false);
		broSprite.animations.play('idle');
		var bro3 = player.addChild(broSprite);

		//bro 2
		pos = healthPos[1];
		broSprite = game.make.sprite(pos[0], pos[1], 'dudebro2');
		broSprite.animations.add('idle', [0,1,2,3,4,5], 7, true);
		broSprite.animations.add('highfive', [6,7,8,9,10,11,12,13], 7, false);
		broSprite.animations.play('idle');
		var bro2 = player.addChild(broSprite);

		//bro 5
		pos = healthPos[4];
		broSprite = game.make.sprite(pos[0], pos[1], 'dudebro5');
		broSprite.animations.add('idle', [0,1,2,3,4,5], 10, true);
		broSprite.animations.play('idle');
		var bro5 = player.addChild(broSprite);

		//bro 6
		pos = healthPos[5];
		broSprite = game.make.sprite(pos[0], pos[1], 'dudebro6');
		broSprite.animations.add('idle', [0,1,2,3,4,5], 10, true);
		broSprite.animations.play('idle');
		var bro6 = player.addChild(broSprite);

		//bro 4
		pos = healthPos[3];
		broSprite = game.make.sprite(pos[0], pos[1], 'dudebro4');
		broSprite.animations.add('idle', [0,1,2,3,4,5], 10, true);
		broSprite.animations.play('idle');
		var bro4 = player.addChild(broSprite);
		
		//bro 1
		pos = healthPos[0];
		broSprite = game.make.sprite(pos[0], pos[1], 'dudebro1');
		broSprite.animations.add('idle', [0], 7, true);
		broSprite.animations.add('row', [0,1,2,3,4,5,6,7,8,9,10], 12, true);
		broSprite.animations.play('idle');
		var bro1 = player.addChild(broSprite);
		
		//add the bros to the list of bros
		player.bros.push(bro1);
		bro1.anchor.set(0.5, 1);
		bro1.kill();

		player.bros.push(bro2);
		bro2.anchor.set(0.5, 1);
		bro2.kill();

		player.bros.push(bro3);
		bro3.anchor.set(0.5, 1);
		bro3.kill();

		player.bros.push(bro4);
		bro4.anchor.set(0.5, 1);
		bro4.kill();

		player.bros.push(bro5);
		bro5.anchor.set(0.5, 1);
		bro5.kill();

		player.bros.push(bro6);
		bro6.anchor.set(0.5, 1);
		bro6.kill();

		
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
		speedMult = 1;
		invulnerable = false;

		//Add Sound and Music Vars to scene
		BGMusic = game.add.audio('backgroundMusic');
		goodSound = game.add.audio('goodSound');
		badSound = game.add.audio('badSound');

		BGMusic.loopFull(0.6); //Loops BG music at 60% Volume
		
		//set game life and score
		invulnerable = false;
		health = score = 0;
		setHealth(1, true);
		//setHealth(6, true);


		//test adding in a dudebro
		/*var dudebro1 = game.add.sprite(200, 200, 'dudebro1');
		dudebro1.animations.add('idle', [0], 7, true);
		dudebro1.animations.add('row', [0,1,2,3,4,5,6,7,8,9,10], 12, true);
		dudebro1.animations.play('idle');

		var dudebro2 = game.add.sprite(300, 200, 'dudebro2');
		dudebro2.animations.add('idle', [0,1,2,3,4,5], 7, true);
		dudebro2.animations.add('highfive', [6,7,8,9,10,11,12,13], 7, false);
		dudebro2.animations.play('idle');

		var dudebro3 = game.add.sprite(400, 200, 'dudebro3');
		dudebro3.animations.add('idle', [0,1,2,3,4,5,6], 12, true);
		dudebro3.animations.add('highfive', [7,8,9,10,11,12,13,14], 7, false);
		dudebro3.animations.play('idle');

		var dudebro4 = game.add.sprite(500, 200, 'dudebro4');
		dudebro4.animations.add('idle', [0,1,2,3,4,5], 10, true);
		dudebro4.animations.play('idle');

		var dudebro5 = game.add.sprite(600, 200, 'dudebro5');
		dudebro5.animations.add('idle', [0,1,2,3,4,5], 10, true);
		dudebro5.animations.play('idle');

		var dudebro6 = game.add.sprite(700, 200, 'dudebro6');
		dudebro6.animations.add('idle', [0,1,2,3,4,5], 10, true);
		dudebro6.animations.play('idle');*/

	}


	function update() {
		
		if (player.top < bgWalls.minHeight) {
			player.top = bgWalls.minHeight;
			player.body.velocity.y = 0;
		}

		if(currentLevel === 2 && scrollSpeed < 7){
			scrollSpeed += 0.05;
		} else if(currentLevel === 3 && scrollSpeed < 9){
			scrollSpeed += 0.05;
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
					[0, boatSpeed * speedMult],
					Math.max(0, Math.min(1, // Constrain to range [0, 1]
						game.physics.arcade.distanceToPointer(player) / slowDist
					))
				)
			);
			
		}
		var velocityMagnitude = player.body.velocity.getMagnitude();
		player.body.drag.x = Math.abs(player.body.velocity.x / velocityMagnitude * dragMagnitude);
		player.body.drag.y = Math.abs(player.body.velocity.y / velocityMagnitude * dragMagnitude);

		if(velocityMagnitude > 0){
			//play moving animation
			player.bros[0].animations.play('row');
		} else{
			//play idle animation
			player.bros[0].animations.play('idle');
		}




		//collectable code
		//collisions
		if (health > 0) {
			game.physics.arcade.overlap(player, items.group, collectItem, null, this);
			game.physics.arcade.overlap(player, bros.group, broPickup, null, this);
			game.physics.arcade.overlap(player, rocks.group, rockHit, null, this);
			game.physics.arcade.overlap(player, powerups.group, powerupHit, null, this);
		}

		game.physics.arcade.overlap(items.group, rocks.group, collisionHandler, null, this);
		game.physics.arcade.overlap(powerups.group, rocks.group, collisionHandler, null, this);
		game.physics.arcade.overlap(bros.group, rocks.group, collisionHandler, null, this);
		game.physics.arcade.overlap(items.group, bros.group, collisionHandler, null, this);
		game.physics.arcade.overlap(items.group, powerups.group, collisionHandler, null, this);
		game.physics.arcade.overlap(bros.group, powerups.group, collisionHandler, null, this);

		/*
		//enemyTestCode
		game.physics.arcade.collide (player, enemy);
		game.physics.arcade.moveToObject(enemy, player, 10, 2000);
		*/

		//update score
		labelScore.text = score + " fps: " + game.time.fps;
	}

	function collisionHandler(item1, item2){
		console.log("COLLISION DETECTED: "+ item1.y);
		item1.y = this.game.rnd.between(bgWalls.minHeight, game.height - (game.cache.getImage('boulder').height / 2));
		console.log("Moved to:  "+ item1.y);
	}
	
	function setHealth(h, noEffect, noInvul) {
		
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
			bros.keys = [('broLife' + (h + 1))];
			goodSound.play();
			if(h >= player.bros.length){
				bros.active = false;
			}
		} else if (h < health) {
			bros.keys = [('broLife' + (h + 1))];
			badSound.play();
			
			// Tint the raft red
			var tintObj = {step: 0};
			game.add.tween(tintObj).to({step: 1}, 500, "Linear", true)
				.onUpdateCallback(function(){
					player.tint = Phaser.Color.interpolateColor(
						0xFF0000, getBaseTint(), 1, tintObj.step
					);
				}).onComplete.add(function(){
					player.tint = getBaseTint();
				});
			
			if (!noInvul) setInvulnerable(1000);
			bros.active = true;
		}
		
		while (h > health) {
			player.bros[health++].revive();
		}
		while (h < health) {
			player.bros[--health].kill();
		}
		
		//bros.keys = [('broLife' + (h + 1))];
		
		labelHealth.text = "Health: " + health;
	}

	function collectItem(thisPlayer, thisItem){
		thisItem.kill();
		score += 1;

		//play high five if enough dudes
		if(health >= 3){
			//play high five
			console.log("play high five");

			//make bros 2 and 3 play high five animation
			var highFiveAnimation = player.bros[1].animations.play('highfive');
			player.bros[1].animations.currentAnim.onComplete.add(function () {	player.bros[1].animations.play('idle');}, this);

			highFiveAnimation = player.bros[2].animations.play('highfive');
			player.bros[2].animations.currentAnim.onComplete.add(function () {	player.bros[2].animations.play('idle');}, this);
		}

		//add item to top of screen
		if(currentLevel === 1){
			var pickupIndicator = game.add.sprite( (score ) * (game.width / 16), bgWalls.minHeight / 2, 'pickup1');
			pickupIndicator.alpha = 0.9;
			pickupIndicator.anchor.set(0.5, 0.5);
		} else if(currentLevel === 2){
			var pickupIndicator = game.add.sprite( (score ) * (game.width / 16), bgWalls.minHeight / 2, 'pickup2');
			pickupIndicator.alpha = 0.9;
			pickupIndicator.anchor.set(0.5, 0.5);
		} else{
			var pickupIndicator = game.add.sprite( (score ) * (game.width / 16), bgWalls.minHeight / 2, 'pickup3');
			pickupIndicator.alpha = 0.9;
			pickupIndicator.anchor.set(0.5, 0.5);
		}
		

		//change levels
		if(score >= 5 && currentLevel === 1){
			console.log("move to level 2");

			//move to level 2
			currentLevel = 2;

			//change object that is spawned
			items.keys = ['pickup2'];

			//change spawner properties
			items.minInt += 1250;
			items.maxInt += 550;
			rocks.minInt -= 650;
			rocks.maxInt -= 650;
			bros.minInt += 500;
			bros.maxInt += 500;
			powerups.minInt += 1250;
			powerups.maxInt += 1000;

		} else if(score >= 10 && currentLevel === 2){
			console.log("move to level 3");
			//move to level 2
			currentLevel = 3;

			//change object that is spawned
			items.keys = ['pickup3'];

			//change spawner properties
			items.minInt += 1000;
			items.maxInt += 1500;
			rocks.minInt -= 700;
			rocks.maxInt -= 750;
			bros.minInt += 500;
			bros.maxInt += 500;
			powerups.minInt += 1000;
			powerups.maxInt += 500;
		}

		else if(score >= 15 && currentLevel == 3){ //For now, Level 3 is the highest we go
			//console.log("Last Level done");

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
		speedUp(2, 5000);
		setInvulnerable(1000);
	}
	
	function speedUp(mult, time) {
		speedMult = mult;
		player.tint = getBaseTint();
		game.time.events.add(time, slowDown, this);
	}

	function slowDown() {
		speedMult = 1;
		player.tint = getBaseTint();
	}
	
	function getBaseTint() {
		if (speedMult > 1) return 0x66FF66;
		if (speedMult < 1) return 0x6666FF;
		return 0xFFFFFF;
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
				200, "Linear", true, 0, Math.round(time / 400), true);
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
			game.load.image('gameLost', 'title.png');
		},

		create: function(){
			var GOimage = game.add.sprite(game.world.centerX, game.world.centerY, 'gameLost'); //add an image to the game to serve as the backdrop.

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
			game.load.image('gameWon', 'title.png');
		},

		create: function(){
			var VicImage = game.add.sprite(game.world.centerX, game.world.centerY, 'gameWon');

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

	
};