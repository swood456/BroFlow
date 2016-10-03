window.onload = function() {

	var game = new Phaser.Game(1334, 750, Phaser.AUTO, '', {
		preload: preload,
		create: create,
		update: update
	});

	var player, dragMagnitude = 500, boatSpeed = 600, slowDist = 200,
		scrollSpeed = 5;

	var items;
	var rocks;

	var score=0;
	var labelScore;
	var lives=3;
	var labelLives;
	
	var world, bgWalls,
		bgKeys = ['bg1', 'bg2', 'bg3',
		          'bg4', 'bg5', 'bg6',
		          'bg7', 'bg8', 'bg9'];

	var BGMusic;
	var goodSound;
	var badSound;

	function preload () {
		
		game.load.path = 'assets/sprites/';

		//load images
		game.load.image ('player', 'player.png')
		         .images(bgKeys)
		         .image ('rock', 'bullet.png')
		         .image ('item', 'star.png')
		         .image ('bro', 'einstein.png')
		         .spritesheet ('dudeBroRaft', 'dude.png', 32, 48);

		//Load in Sound effects and BG Music
		game.load.path = 'assets/sounds/';

		game.load.audio ('backgroundMusic', 'StockBGMusic.mp3')
				 .audio ('goodSound', 'chimeSound.wav')
				 .audio ('badSound', 'boingSound.wav');
	}

	function create () {
		//load arcade physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		game.stage.backgroundColor = '#0072bc';
		
		world   = game.add.group();
		bgWalls = new BGWalls(game, world, bgKeys);
		game.world.bounds.y = bgWalls.minHeight;

		//make a player thing
		player = game.add.sprite(200,200, 'dudeBroRaft');

		game.physics.enable(player, Phaser.Physics.ARCADE);
		
		player.anchor.setTo(0.5,0.5);

		player.body.collideWorldBounds = true;

		player.body.drag.x = Math.sqrt(2) * dragMagnitude;
		player.body.drag.y = Math.sqrt(2) * dragMagnitude;
		
		//create memorabilia items

		items = game.add.group(world);
		items.enableBody = true;

		//create rock
		rocks = game.add.group(world);
		rocks.enableBody = true;

		//create bro
		bros = game.add.group(world);
		bros.enableBody = true;

		//create all the objects
		for(var i=0;i<12;i++){
			//mems
			var item = items.create(900,i*240,'item');
			item.body.velocity.x = -100;
			//rocks
			var rock = rocks.create(900,80+i*240,'rock');
			rock.body.velocity.x = -100;
			//bros
			var bro = bros.create(900,160+i*240,'bro')
			bro.body.velocity.x = -100;
		}

		//score label
		var style = {font: "32px Arial", fill: "#1100ff", align: "center"};
		var text = score;
		labelScore = game.add.text (100, 500, text, style);
		text = lives;
		labelLives = game.add.text (300, 500, text, style);

		//Add Sound and Music Vars to scene

		BGMusic = game.add.audio('backgroundMusic');
		goodSound = game.add.audio('goodSound');
		badSound = game.add.audio('badSound');

		//BGMusic.play();

		BGMusic.loopFull(0.6); //Loops BG music at 60% Volume
		BGMusic.onLoop.add(hasLooped, this); //Debug function. "hasLooped" should output a console.log() message when called on a loop
	}


	function update() {
		
		world.x -= scrollSpeed;
		scrollSpeed = Math.min(scrollSpeed * 1.001, 100);
		bgWalls.update();
		
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
			
		} else {
			var velocityMagnitude = Math.sqrt(player.body.velocity.x * player.body.velocity.x + player.body.velocity.y * player.body.velocity.y);

			//if boat is moving with some amount of speed
			if(velocityMagnitude < 10) {
				player.body.drag.x = Math.sqrt(2) * dragMagnitude;
				player.body.drag.y = Math.sqrt(2) * dragMagnitude;
			} else {
				//vector stuff
				player.body.drag.x = Math.abs(player.body.velocity.x / velocityMagnitude * dragMagnitude);
				player.body.drag.y = Math.abs(player.body.velocity.y / velocityMagnitude * dragMagnitude);

			}
		}

		//collectable code
		//collisions
		game.physics.arcade.overlap(player, items, collectItem, null, this);
		game.physics.arcade.overlap(player, bros, broPickup, null, this);
		game.physics.arcade.overlap(player, rocks, rockHit, null, this);

		//update score
		labelScore.text = score;
		labelLives.text = lives;

	}

	function collectItem(thisPlayer, thisItem){
		thisItem.kill();
		score += 1;
		goodSound.play();
	}

	function broPickup(thisPlayer, thisBro){
		thisBro.kill();
		lives += 1;
		goodSound.play();
	}

	function rockHit(thisPlayer, thisRock){
		thisRock.kill();
		lives -= 1;
		badSound.play();
	}

	//Fucntion to test that background music is looping. Mainly debugging function right now.
	function hasLooped(sound) {

    console.log("Song looping");

	}

};