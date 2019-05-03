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

    for (offSetY = -1; offSetY < 2; offSetY++) {
        for (offSetX = -1; offSetX < 2; offSetX++) {
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
    var playerTile = new RoomDataTile(this.player.yPos, this.player.xPos);
    var allRoomsButPlayer = layer1Generator.rooms.filter(room => {
        console.log(room.tiles.filter(tile => tile.yPos == playerTile.yPos && tile.xPos == playerTile.xPos).length);
        !room.tiles.includes(playerTile);
    });
    //get a room, the room cannot contain the players starting position
    //get a random number between 0 and 1
    //get the amount of chests for this room
    //number of goblins = (number of tiles / 10 * random number + (amount of chests / 2)roundedUp)roundedUp
    //place goblins randomly in room
};

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
    if(!isTraverseable(yPos, xPos)) {
        return false;
    }

    this.player.yPos = yPos;
    this.player.xPos = xPos;
    return true;
};

//TODO: cool feature, if enemy inspects something, and player is close enough to see.
// document to console
Layer3Generator.prototype.inspect = function (yPos, xPos) {
    if(layer2Generator.isOccupied(yPos, xPos)) {
        return layer2Generator.getObject(yPos, xPos).inspect();
    }
    else {
        return null;
    }
};

//TODO: cool feature, if enemy interacts with something, and player is close enough to see.
// document to console
Layer3Generator.prototype.interact = function (yPos, xPos) {
    if(layer2Generator.isOccupied(yPos, xPos)) {
        return layer2Generator.getObject(yPos, xPos).interact();
    }
    else {
        return null;
    }
};