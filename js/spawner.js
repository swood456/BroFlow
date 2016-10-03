function Spawner(game, parent, keys, minInt, maxInt, minY, maxY) {
	this.game   = game;
	this.group  = game.add.group(parent);
	this.keys   = keys;
	this.minInt = minInt;
	this.maxInt = maxInt;
	this.minY   = minY || 0;
	this.maxY   = (maxY !== undefined) ? maxY : game.height;
	this.timer  = game.rnd.between(minInt, maxInt);
}
Spawner.prototype.update = function() {
	this.timer -= this.game.time.elapsedMS;
	if (this.timer <= 0) {
		this.spawn(
			screenToWorldX(this.game.width),
			this.game.rnd.between(this.minY, this.maxY),
			this.game.rnd.pick(this.keys)
		);
		this.timer = this.game.rnd.between(this.minInt, this.maxInt);
	}
}
Spawner.prototype.spawn = function(x, y, key) {
	var s = this.group.getFirstDead(true, x, y, key);
	s.autoCull = true;
	s.outOfCameraBoundsKill = true;
}