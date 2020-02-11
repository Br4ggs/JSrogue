var Layer2Generator = function () {
    this.maxItems = 8;
    this.items = [];
    this.doors = [];
    this.upStairCase;
    this.downStairCase;
};

Layer2Generator.prototype.generateLayer = function () {
    this.placeStairCases();
    this.placeItems();
    this.placeDoors();
};

Layer2Generator.prototype.placeStairCases = function () {
    function getCornerTilesFromRoom(room) {
        return room.tiles.filter(tile => {
            var neighbouringWalls = 0;
            for (offSetY = -1; offSetY < 2; offSetY++) {
                for (offSetX = -1; offSetX < 2; offSetX++) {

                    if (offSetY === offSetX || offSetY === -offSetX)
                        continue;

                    if (layer1Generator.grid[tile.yPos + offSetY][tile.xPos + offSetX].symbol === '#') {
                        neighbouringWalls++;
                        if (neighbouringWalls >= 2) {
                            return true;
                        }
                    }
                }
            }
        });
    }

    var firstRoom = shuffle(layer1Generator.rooms)[0];
    var firstRoomCornerTiles = getCornerTilesFromRoom(firstRoom);

    var secondRoom = shuffle(layer1Generator.rooms)[0];
    var secondRoomCornerTiles = getCornerTilesFromRoom(secondRoom);

    var upTile = shuffle(firstRoomCornerTiles)[0];
    this.upStairCase = new StairCase(upTile.yPos, upTile.xPos, true);
    // For the down staircase we do an extra filter to make sure there's no possibility of putting both staircases on the same tile.
    var downTile = shuffle(secondRoomCornerTiles).filter(tile => tile !== this.upStairCase)[0];
    this.downStairCase = new StairCase(downTile.yPos, downTile.xPos, false);
};

Layer2Generator.prototype.placeItems = function () {
    let placedKey = false;
    let tiles = shuffle(layer1Generator.rooms.flatMap(room => room.tiles));

    let placedItems = 0;
    while(tiles.length > 0) {
        const tile = tiles.pop();
        if (!placedKey) {
            this.registerObject(new Key(tile.yPos, tile.xPos));
            placedKey = true;
        }
        else if (Math.random() > 0.75) {
            this.registerObject(new Potion(tile.yPos, tile.xPos, 3));
        }
        else {
            this.registerObject(new GoldSack(tile.yPos, tile.xPos, 2));
        }
        placedItems++;
        if(placedItems >= this.maxItems){
            break;
        }
    }
};

Layer2Generator.prototype.placeDoors = function () {
    for (y = 1; y < layer1Generator.rows - 1; y++) {
        for (x = 1; x < layer1Generator.columns - 1; x++) {
            var tile = layer1Generator.grid[y][x];
            if (tile.symbol === '.' && !tile.isRoom) {
                var upTile = layer1Generator.grid[y - 1][x];
                var downTile = layer1Generator.grid[y + 1][x];
                var leftTile = layer1Generator.grid[y][x - 1];
                var rightTile = layer1Generator.grid[y][x + 1];

                if (upTile.symbol === '.' && downTile.symbol === '.' && upTile.regionId !== downTile.regionId ||
                    leftTile.symbol === '.' && rightTile.symbol === '.' && leftTile.regionId !== rightTile.regionId) {
                    var newDoor = new Door(y, x);
                    this.doors.push(newDoor);
                }
            }
        }
    }
};

Layer2Generator.prototype.isOccupied = function (yPos, xPos) {
    if (this.upStairCase !== undefined && this.upStairCase.yPos === yPos && this.upStairCase.xPos === xPos) {
        return true;
    }

    if (this.downStairCase !== undefined && this.downStairCase.yPos === yPos && this.downStairCase.xPos === xPos) {
        return true;
    }

    if (this.items.filter(item => (item.yPos === yPos && item.xPos === xPos)).length > 0) {
        return true;
    }

    if (this.doors.filter(door => (door.yPos === yPos && door.xPos === xPos)).length > 0) {
        return true;
    }

    return false;
};

Layer2Generator.prototype.getObject = function (yPos, xPos) {
    if (this.upStairCase.yPos === yPos && this.upStairCase.xPos === xPos) {
        return this.upStairCase;
    }

    if (this.downStairCase.yPos === yPos && this.downStairCase.xPos === xPos) {
        return this.downStairCase;
    }

    if (this.items.filter(item => (item.yPos === yPos && item.xPos === xPos)).length > 0) {
        return this.items.filter(item => (item.yPos === yPos && item.xPos === xPos))[0];
    }

    if (this.doors.filter(door => (door.yPos === yPos && door.xPos === xPos)).length > 0) {
        return this.doors.filter(door => (door.yPos === yPos && door.xPos === xPos))[0];
    }
    
    return null;
};

Layer2Generator.prototype.registerObject = function (addedItem) {
    this.items.push(addedItem);
};

Layer2Generator.prototype.removeObject = function (removedItem) {
    this.items = this.items.filter(item => (item.id !== removedItem.id));
};