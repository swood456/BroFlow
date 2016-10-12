function BGWalls(game, parent, wallKeys, skyKeys) {
	this.game  = game;
	this.group = game.add.group(parent);
	this.wallKeys = wallKeys;
	this.skyKeys  = skyKeys;
	this.nextSky = false;
	
	this.minWidth = this.minHeight = Infinity;
	for (var i = wallKeys.length - 1; i >= 0; --i) {
		var image = game.cache.getImage(wallKeys[i]);
		this.minWidth  = Math.min(this.minWidth,  image.width);
		this.minHeight = Math.min(this.minHeight, image.height);
	}
	for (var i = skyKeys.length - 1; i >= 0; --i) {
		var image = game.cache.getImage(skyKeys[i]);
		this.minWidth  = Math.min(this.minWidth,  image.width);
		this.minHeight = Math.min(this.minHeight, image.height);
	}
	this.group.y = this.minHeight;
	
	// Window must always be covered
	this.numSprites = Math.ceil(game.width / this.minWidth) + 1;
	this.first = this.right = 0;
	
	for (var i = this.numSprites; i > 0; --i) {
		var s = this.group.create(this.right, 0, this.game.rnd.pick(
			this.nextSky ? this.skyKeys : this.wallKeys));
		s.anchor.setTo(0, 1); // Bottom left
		this.right = s.right;
		this.nextSky = !this.nextSky;
	}
}
BGWalls.prototype.update = function() {
	var sprite;
	while (!(sprite = this.group.getAt(this.first)).inCamera) {
		sprite.x = this.right;
		sprite.key = this.game.rnd.pick(
			this.nextSky ? this.skyKeys : this.wallKeys);
		this.right = sprite.right;
		this.first = (this.first + 1) % this.numSprites;
		this.nextSky = !this.nextSky;
	}
}