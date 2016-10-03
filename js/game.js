window.onload = function() {

	var game = new Phaser.Game(1334, 750, Phaser.AUTO, '', {
		preload: preload,
		create: create,
		update: update
	});

	var player, dragMagnitude = 500, boatSpeed = 400,
		scrollSpeed = 5;
	
	var world, bgWalls,
		bgKeys = ['bg1', 'bg2', 'bg3',
		          'bg4', 'bg5', 'bg6',
		          'bg7', 'bg8', 'bg9'];

	function preload () {
		
		game.load.path = 'assets/sprites/';

		//load images
		game.load.image('player', 'player.png')
		         .images(bgKeys);
	}

	function create () {
		//load arcade physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		game.stage.backgroundColor = '#0072bc';
		
		world   = game.add.group();
		bgWalls = new BGWalls(game, world, bgKeys);
		game.world.bounds.y = bgWalls.minHeight;

		//make a player thing
		player = game.add.sprite(200,200, 'player');

		game.physics.enable(player, Phaser.Physics.ARCADE);
		
		player.anchor.setTo(0.5,0.5);

		player.body.collideWorldBounds = true;

		player.body.drag.x = Math.sqrt(2) * dragMagnitude;
		player.body.drag.y = Math.sqrt(2) * dragMagnitude;

	}


	function update() {
		
		world.x -= scrollSpeed;
		scrollSpeed = Math.min(scrollSpeed * 1.001, 100);
		bgWalls.update();
		
		//do something with the drag somehow
		if(player.body.velocity);
		//game.time.elapsed
		
		if(game.input.activePointer.leftButton.isDown) {

			//move player towards mouse button
			game.physics.arcade.moveToPointer(player, 500);
			player.body.velocity.x = Math.min(
				player.body.velocity.x,
				player.body.velocity.x,
			);
			//	Math.pow(game.physics.arcade.distanceToPointer(player), 2) / 40) );
			//console.log("velocity: " + Math.pow(game.physics.arcade.distanceToPointer(player), 2));
			//game.physics.accelerateToPointer(player, this.game.input.activePointer, 600, 100, 100);
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
	}

};