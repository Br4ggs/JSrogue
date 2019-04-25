var Layer3Generator = function () {
    this.player;

    //list of enemies
};

Layer3Generator.prototype.generateLayer = function () {
    this.setPlayerPos();
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

/**
 * Moves an entity 1 step into a given direction.
 * @param {String} direction the direction to move in, choose from UP, DOWN, LEFT or RIGHT.
 * @returns {boolean} Wether the entity succesfully moved or not.
 */
Layer3Generator.prototype.moveEntity = function (direction) {
    switch (direction) {
        case 'UP':
            return this.setPosition(this.player.yPos - 1, this.player.xPos);
        case 'DOWN':
            return this.setPosition(this.player.yPos + 1, this.player.xPos);
        case 'LEFT':
            return this.setPosition(this.player.yPos, this.player.xPos - 1);
        case 'RIGHT':
            return this.setPosition(this.player.yPos, this.player.xPos + 1);
        default:
            return false;
    }
};

/**
 * Sets an entities position to the given values.
 * @param {int} y The row of the tile.
 * @param {int} x The column of the tile.
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