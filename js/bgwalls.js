function BGWalls(game, parent, keys) {
	this.game  = game;
	this.group = game.add.group(parent);
	this.keys  = keys;
	
	this.minWidth = this.minHeight = Infinity;
	for (var i = keys.length - 1; i >= 0; --i) {
		var image = game.cache.getImage(keys[i]);
		this.minWidth  = Math.min(this.minWidth,  image.width);
		this.minHeight = Math.min(this.minHeight, image.height);
	}
	this.group.y = this.minHeight;
	
	// Window must always be covered
	this.numSprites = Math.ceil(game.width / this.minWidth) + 1;
	this.first = this.right = 0;
	
	for (var i = this.numSprites; i > 0; --i) {
		var s = this.group.create(this.right, 0, game.rnd.pick(keys));
		s.anchor.setTo(0, 1); // Bottom left
		this.right = s.right;
	}
}
BGWalls.prototype.update = function() {
	var sprite;
	while (!(sprite = this.group.getAt(this.first)).inCamera) {
		sprite.x = this.right;
		sprite.key = this.game.rnd.pick(this.keys);
		this.right = sprite.right;
		this.first = (this.first + 1) % this.numSprites;
	}
}