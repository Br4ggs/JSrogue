var Layer3Generator = function () {
    this.maxGoblins = 8;

    this.player;
    this.goblins = [];
};

Layer3Generator.prototype.generateLayer = function () {
    this.setPlayerPos();
    //this.spawnGoblins();
};

Layer3Generator.prototype.setPlayerPos = function () {

    var stairPos = layer2Generator.upStairCase;
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

Layer3Generator.prototype.getEntity = function (yPos, xPos) {
    if (this.player.yPos === yPos && this.player.xPos === xPos){
        return this.player;
    }
    const filteredGoblins = this.goblins.filter(goblin => (goblin.yPos === yPos && goblin.xPos === xPos));
    if (filteredGoblins.length === 1) {
        return filteredGoblins[0];
    }
}

//TODO: these need to be general methods, not just for player
Layer3Generator.prototype.moveEntity = function (yDir, xDir) {
    return this.setPosition(this.player.yPos + yDir, this.player.xPos + xDir);
};

Layer3Generator.prototype.registerEntity = function () {
    //TODO: 
};

Layer3Generator.prototype.removeEntity = function (entity) {
    if(entity.constructor.name === "Player") {
        gameOver();
    }

    this.goblins = this.goblins.filter(goblin => (goblin.id !== entity.id));

};

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
//TODO: this is getting too complicated for a simple boolean expression, this should probably be replaced
//by some kind of log
Layer3Generator.prototype.attack = function (caller, yPos, xPos) {
    if (this.isOccupied(yPos, xPos)) {
        const entity = this.getEntity(yPos, xPos);
        entity.health -= caller.attackPwr;

        writeToConsole(`The ${caller.constructor.name} hit the ${entity.constructor.name} for ${caller.attackPwr} damage.`);

        if(entity.health <= 0) {
            writeToConsole(`The ${entity.constructor.name} died.`);
            this.removeEntity(entity);
        }
        return true;
    }
    else {
        return false;
    }
}

Layer3Generator.prototype.addPlayerGold = function (amount) {
    this.player.gold += amount;
    return `You added ${amount} gold to your inventory.`;
};

Layer3Generator.prototype.setPlayerKey = function (bool) {
    this.player.hasKey = bool;
    return "You put the key in your inventory.";
};

Layer3Generator.prototype.healPlayer = function (amount) {
    this.player.health += amount;
    if (this.player.health > this.player.maxHealth) {
        this.player.health = this.player.maxHealth;
    }
    return `You were healed ${amount} points.`;
};

