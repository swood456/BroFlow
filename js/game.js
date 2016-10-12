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

	var invulnerable = false, invulTween, powerupActive = false, enemyInvulnerable = false, enemyInvulTween;
	
	var items, rocks, bros, deadbros, powerups;


	//enemyTestCode
	var enemy;
	var enemySpawned = false;
	var enemyHealth = 3;
	

/*ORIGINAL DUDE BRO POSITIONS
	var score, labelScore, health, labelHealth, healthPos = [
			[-10,  100], // 1
			[-47, -22], // 2
			[-8, -20], // 3
			[50,  0], // 4
			[ 70, -20], // 5
			[ 30, -10] // 6
		],
		currentLevel;
*/
//JORDAN SUGGESTED DUDE BRO POSITIONS
	var score, labelScore, health, labelHealth, healthPos = [
			[-10,  95], // 1 - paddler
			[-42, -22], // 2 - red swag
			[-3 , -20], // 3 - blue yolo
			[ 40, -10], // 4 - orange
			[ 60,  10], // 5 - green
			[-25,  15]  // 6 - pink
		],
		currentLevel;
	//ends here


	var world, bgWalls, water,
		bgKeys = ['bg1', 'bg2', 'bg3',
		          'bg4', 'bg5', 'bg6',
		          'bg7', 'bg8', 'bg9'];

	var BGMusic, gameoverSound, badSound, whipSound, broSounds, happySounds;

	function preload () {
		
		game.load.path = 'assets/sprites/';

		//load images
		game.load.image ('player', 'mattress.png')
		         .images(bgKeys)
		         .image ('bricks', 'bricks.png')
		         .image ('boulder', 'boulder.png')
		         .image ('item', 'star.png')
		         .image ('broLife2', 'swag_floating.png')
		         .image ('broLife3', 'yolo_floating.png')
		         .image ('broLife4', 'stripes_floating.png')
		         .image ('broLife5', 'green_floating.png')
		         .image ('broLife6', 'pink_floating.png')
		         .image ('broDeath1', 'paddle_sink.png')
		         .image ('broDeath2', 'swag_sink.png')
		         .image ('broDeath3', 'yolo_sink.png')
		         .image ('broDeath4', 'stripes_sink.png')
		         .image ('broDeath5', 'green_sink.png')
		         .image ('broDeath6', 'pink_sink.png')
		         .image ('pickup1', 'cup.png')
		         .image ('pickup2', 'glowsticks.png')
		         .image ('pickup3', 'tshirt.png')
		         .image ('pickup1Icon', 'cup icon.png')
		         .image ('pickup2Icon', 'glowsticks icon.png')
		         .image ('pickup3Icon', 'tshirt icon.png')
		         .image ('water', 'water 1.png')
		         .image ('powerup', 'soda bottle 2.png')
		         .spritesheet ('dude', 'dude.png', 32, 48)
		         .spritesheet ('dudebro1', 'dudebro_PaddleSpriteSheet_12fps_120pixelsWide.png', 120, 140)
		         .spritesheet ('dudebro2', 'Swag_fistPump_highFive_7fps_40pixelsWide.png', 40, 75)
		         .spritesheet ('dudebro3', 'Yolo_fistPump_highFive_40pixelsWide.png', 40, 80)
		         .spritesheet ('dudebro4', 'Stripes_animation_10fps_42pixelswide.png', 42, 85)
		         .spritesheet ('dudebro5', 'Green_SpriteSheet_10fps_42pixelsWide.png', 42, 74)
		         .spritesheet ('dudebro6', 'Pink_SpriteSheet_10fps_42pixelswide.png', 42, 74);

		
		//enemyTestCode
		game.load.image ('enemy', 'enemy.png');
		

		//Load in Sound effects and BG Music
		game.load.path = 'assets/sounds/';

		game.load.audio ('backgroundMusic', 'StockBGMusic.mp3') //BG Music from http://www.orangefreesounds.com/electro-punk-action-background-music/, permitted for non-commercial use
				 .audio ('badSound', 'WaterSplash2.wav')
				 .audio ('whipcrack', 'whipcrack.mp3')
				 .audio ('ohyeah', 'ohyeah.mp3')
				 .audio ('radical', 'radical.mp3')
				 .audio ('broshout1', 'bro1.mp3')
				 .audio ('broshout2', 'bro2.mp3')
				 .audio ('broshout3', 'bro3.mp3')
				 .audio ('awwno', 'awwno.mp3');
	}

	function create () {
		invulnerable = false;
		
		game.time.advancedTiming = true;
		//load arcade physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//game.stage.backgroundColor = '#0072bc';
		water = game.add.tileSprite(0, 0, game.width, game.height, 'water');
		
		world    = game.add.group();
		bgWalls  = new BGWalls(game, world, bgKeys);
		items    = new Spawner(game, world, ['pickup1'], 600, 1000, bgWalls.minHeight, game.height - (game.cache.getImage('pickup1').height));
		deadbros = game.add.group(world, undefined, false, true, Phaser.Physics.ARCADE);
		rocks    = new Spawner(game, world, ['boulder', 'bricks'], 1800, 2000, bgWalls.minHeight, game.height - (game.cache.getImage('boulder').height / 2));
		bros     = new Spawner(game, world, ['broLife2'], 500, 900, bgWalls.minHeight, game.height - (game.cache.getImage('broLife2').height));
		powerups = new Spawner(game, world, ['powerup'], 15000, 20000, bgWalls.minHeight, game.height - (game.cache.getImage('powerup').height));

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
		broSprite.animations.add('idle', [0,1,2,3,4,5,6,7,8,9,10], 8, true);
		broSprite.animations.add('row', [0,1,2,3,4,5,6,7,8,9,10], 12, false).onComplete.add(function(){
			broSprite.animations.play('idle');
		})
		broSprite.animations.add('speedRow', [0,1,2,3,4,5,6,7,8,9,10], 36, true);
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
		gameoverSound = game.add.audio('awwno');
		badSound = game.add.audio('badSound');
		whipSound = game.add.audio('whipcrack');
		whipSound.onStop.add(function(){
			game.rnd.pick(happySounds).play();
		});
		broSounds = [
			game.add.audio('broshout1'),
			game.add.audio('broshout2'),
			game.add.audio('broshout3')
		];
		happySounds = [
			game.add.audio('radical'),
			game.add.audio('ohyeah')
		];

		BGMusic.loopFull(0.08); //Loops BG music at 60% Volume
		
		//set game life and score
		invulnerable = false;
		health = score = 0;
		setHealth(1, true);

	}


	function update() {
		
		//make sure player cannot enter top area of the screen
		if (player.top < bgWalls.minHeight) {
			player.top = bgWalls.minHeight;
			player.body.velocity.y = 0;
		}

		//gradually speed up the world when moving between levels
		if(currentLevel === 2 && scrollSpeed < 7){
			scrollSpeed += 0.05;
		} else if(currentLevel === 3 && scrollSpeed < 9){
			scrollSpeed += 0.05;
		}
		
		//make the objects and water scroll
		world.x -= scrollSpeed;
		water.tilePosition.x -= scrollSpeed*0.9;

		//call the update function for all the spawners
		bgWalls.update();
		items.update();
		rocks.update();
		bros.update();
		powerups.update();
		
		//check if the player is alive and player is "tapping"
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
			if(!powerupActive){
				player.bros[0].animations.play('row');
			}
			
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

		game.physics.arcade.overlap(items.group, rocks.group, collisionHandler, null, this);
		game.physics.arcade.overlap(powerups.group, rocks.group, collisionHandler, null, this);
		game.physics.arcade.overlap(bros.group, rocks.group, collisionHandler, null, this);
		game.physics.arcade.overlap(items.group, bros.group, collisionHandler, null, this);
		game.physics.arcade.overlap(items.group, powerups.group, collisionHandler, null, this);
		game.physics.arcade.overlap(bros.group, powerups.group, collisionHandler, null, this);

		
		//enemyTestCode
		if(enemySpawned){
			game.physics.arcade.collide (player, enemy);
			game.physics.arcade.moveToObject(enemy, player, 50);
			game.physics.arcade.overlap(enemy, rocks.group, enemyHitRock, null, this);
		}	

		//update score
		labelScore.text = score + " fps: " + game.time.fps;
	}

	function collisionHandler(item1, item2){
		console.log("Collision Detected At: "+ item1.y);
		item1.y = this.game.rnd.between(bgWalls.minHeight, game.height - (game.cache.getImage('boulder').height / 2));
		console.log("Moved to:  "+ item1.y);
	}

	//enemyTestCode
	function spawnEnemy(){
		enemy = game.add.sprite(200,400, 'enemy');
		game.physics.enable(enemy, Phaser.Physics.ARCADE);
		enemy.anchor.setTo(0.5,0.5);
		//enemy.body.collideWorldBounds = true;

		//enemy.body.drag.x = Math.sqrt(2) * dragMagnitude;
		//enemy.body.drag.y = Math.sqrt(2) * dragMagnitude;


		enemySpawned = true;
	}
	function enemyHitRock(enemy){
		
		if(!enemyInvulnerable){ 
			enemyHealth -= 1;
		} else{
			console.log("Enemy is Invulnerable");
		}

		if(enemyHealth <= 0){
			enemy.kill();
		}
		
		if (!enemyInvulnerable) {
			setEnemyInvulnerable(1000); //Give enemy one second of invincibility if it is not already
		};
	}

	//Enemy Invulnerability function in progress
	function setEnemyInvulnerable(time) {
		if (time === 0) {
			enemyInvulnerable = false;
			enemyInvulTween.stop();
			enemy.alpha = 1;
			return;
		}
		time = time || 1000;
		
		if (!enemyInvulTween || enemyInvulTween.totalDuration < time) {
			enemyInvulnerable = true;

			if(enemyInvulTween) {
				enemyInvulTween.stop();
				enemy.alpha = 1;
			}
			
			enemyInvulTween = game.add.tween(enemy).from({alpha: 0.5},
				200, "Linear", true, 0, Math.round(time / 400), true);
			enemyInvulTween.onComplete.add(function(){
				enemyInvulnerable = false;
			} );
		}
	}
	
	function setHealth(h, noEffect, noInvul) {
		
		if (h > player.bros.length) {
			h = player.bros.length;
		} else if (h <= 0) {
			h = 0;
			game.camera.fade('#000000', 1500, false);
			game.camera.onFadeComplete.add(function(){
				game.state.start("gameOver"); //Go to gameOver state if out of health
			}, this);
			gameoverSound.play();
		}
		
		if (noEffect) {
			// No effect, dummy
		} else if (h > health) {
			bros.keys = ['broLife' + (h + 1)];
			if(h >= player.bros.length){
				bros.active = false;
			}
		} else if (h < health) {
			bros.keys = ['broLife' + (h + 1)];
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
			var s = deadbros.getFirstDead(true,
				screenToWorldX(player.x) - 100, player.y,
				'broDeath' + health);
			s.autoCull = true;
			s.outOfCameraBoundsKill = true;
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
			player.bros[1].animations.currentAnim.onComplete.add(function () {
				player.bros[1].animations.play('idle');
			}, this);

			highFiveAnimation = player.bros[2].animations.play('highfive');
			player.bros[2].animations.currentAnim.onComplete.add(function () {
				player.bros[2].animations.play('idle');
			}, this);
			
			whipSound.play();
		}else{
			game.rnd.pick(happySounds).play();
		}

		var pickupIndicator = game.add.sprite( (score ) * (game.width / 16), bgWalls.minHeight / 2, 'pickup' + currentLevel +'Icon');
		pickupIndicator.alpha = 0.9;
		pickupIndicator.anchor.set(0.5, 0.5);
		

		//change levels
		if(score >= 5 && currentLevel === 1){
			console.log("move to level 2");

			//move to level 2
			currentLevel = 2;

			//enemyTestCode
			spawnEnemy();

			//change object that is spawned
			items.keys = ['pickup2'];

			//change spawner properties
			items.minInt += 1250;
			items.maxInt += 550;
			rocks.minInt -= 750;
			rocks.maxInt -= 850;
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
			rocks.minInt -= 800;
			rocks.maxInt -= 550;
			bros.minInt += 500;
			bros.maxInt += 500;
			powerups.minInt += 1000;
			powerups.maxInt += 500;

		}

		else if(score >= 15 && currentLevel == 3){ //For now, Level 3 is the highest we go
		//else if(score >= 1 && currentLevel == 1){ //For now, Level 3 is the highest we go
			//do some nice stuff to make people happy
			items.active = false;
			rocks.active = false;
			bros.active = false;
			powerups.active = false;
			
			//wait for all the objects to be off the screen
			//game.time.events.add(4000, moveOffscreen, this);
			game.time.events.add(3000, moveOffscreen, this);

		}
	}

	function moveOffscreen(){
		//remove player's ability to move
		boatSpeed = 0;
		player.body.collideWorldBounds = false;
		player.bros[0].animations.play('speedRow');

		//move the boat
		console.log("attmept to tween");

		//game.add.tween(player).to({ x: 2000 }, 3000, Phaser.Easing.Sinusoidal.InOut, true, 0, 0, false);
		var moveTween = game.add.tween(player).to({ x: game.width + player.width }, 3000, Phaser.Easing.Sinusoidal.InOut, false, 0, 0, false);
		moveTween.onComplete.add(moveToEndGameScreen, this);
		moveTween.start();


		/*var moveTween = game.add.tween(player);
		moveTween.to({x:2000}, 3000,Phaser.Easing.Bounce.In);
		moveTween.onComplete.add(moveToEndGameScreen, this);
		moveTween.start;*/
	}

	function moveToEndGameScreen(){
		game.camera.fade('#000000', 1000, false);
			game.camera.onFadeComplete.add(function(){
				game.state.start("victory"); //Go to gameOver state if out of health
			}, this);
	}

	function broPickup(thisPlayer, thisBro){
		thisBro.kill();
		setHealth(health + 1);
		game.rnd.pick(broSounds).play();
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
		setInvulnerable(4800);
	}
	
	function speedUp(mult, time) {
		speedMult = mult;
		player.tint = getBaseTint();

		player.bros[0].animations.play('speedRow');
		powerupActive = true;
		game.time.events.add(time, slowDown, this);
	}

	function slowDown() {
		speedMult = 1;
		player.tint = getBaseTint();
		player.bros[0].animations.play('row');
		powerupActive = false;
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