var Layer3Generator = function () {
    this.maxGoblins = 8;

    this.player;
    this.goblins = [];
};

Layer3Generator.prototype.generateLayer = function () {
    this.setPlayerPos();
    this.spawnGoblins();
};

Layer3Generator.prototype.setPlayerPos = function () {

    var stairPos = layer2Generator.downStairCase;
    var availableTiles = [];

    for (var offSetY = -1; offSetY < 2; offSetY++) {
        for (var offSetX = -1; offSetX < 2; offSetX++) {
            if (offSetY === 0 && offSetX === 0)
                continue;

            var tile = layer1Generator.grid[stairPos.yPos + offSetY][stairPos.xPos + offSetX];
            if (tile.symbol === '.' && tile.isRoom) {
                availableTiles.push({ yPos: stairPos.yPos + offSetY, xPos: stairPos.xPos + offSetX });
            }
        }
    }

    var playerPos = shuffle(availableTiles)[0];

    this.player = new Player(playerPos.yPos, playerPos.xPos);
};

Layer3Generator.prototype.spawnGoblins = function() {
    var allRoomsButPlayer = layer1Generator.rooms.filter(room =>
        room.tiles.filter(tile => tile.yPos === this.player.yPos && tile.xPos === this.player.xPos).length < 1);

    var tiles = shuffle(allRoomsButPlayer.flatMap(room => room.tiles));

    var placedGoblins = 0;
    while(tiles.length > 0) {
        var currentTile = tiles.pop();
        this.goblins.push(new Goblin(currentTile.yPos, currentTile.xPos));
        placedGoblins++;
        if(placedGoblins >= this.maxGoblins){
            break;
        }
    }
};

Layer3Generator.prototype.isOccupied = function (yPos, xPos) {
    if (this.player.yPos === yPos && this.player.xPos === xPos){
        return true;
    }

    if (this.goblins.filter(goblin => (goblin.yPos === yPos && goblin.xPos === xPos)).length > 0) {
        return true;
    }
}

/**
 * Moves an entity 1 step into a given direction.
 * @param {number} yDir the y direction to move in, can be -1 for upwards, 1 for downwards or 0 for no movement.
 * @param {number} xDir the x direction to move in, can be -1 for left, 1 for right or 0 for no movement.
 * @returns {boolean} Wether the entity succesfully moved or not.
 */
Layer3Generator.prototype.moveEntity = function (yDir, xDir) {
    return this.setPosition(this.player.yPos + yDir, this.player.xPos + xDir);
};

/**
 * Sets an entities position to the given values.
 * @param {int} yPos The row of the tile.
 * @param {int} xPos The column of the tile.
 * @returns {boolean} Wether the entity was succesfully moved or not.
 */
Layer3Generator.prototype.setPosition = function (yPos, xPos) {
    if(!isTraverseable(yPos, xPos) || this.isOccupied(yPos, xPos)) {
        return false;
    }

    this.player.yPos = yPos;
    this.player.xPos = xPos;
    return true;
};

Layer3Generator.prototype.inspect = function (yPos, xPos) {
    if(layer2Generator.isOccupied(yPos, xPos)) {
        layer2Generator.getObject(yPos, xPos).inspect();
        return true;
    }
    else {
        return false;
    }
};

Layer3Generator.prototype.interact = function (yPos, xPos) {
    if (layer2Generator.isOccupied(yPos, xPos)) {
        layer2Generator.getObject(yPos, xPos).interact();
        return true;
    }
    else {
        return false;
    }
};

Layer3Generator.prototype.addPlayerGold = function (amount) {
    this.player.gold += amount;
    return `You added ${amount} to your inventory.`;
};

Layer3Generator.prototype.setPlayerKey = function (bool) {
    this.player.hasKey = bool;
    return "You put the key in your inventory.";
};

Layer3Generator.prototype.healPlayer = function (amount) {
    return `You were healed ${amount} points.`;
};

