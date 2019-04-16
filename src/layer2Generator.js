var Layer2Generator = function () {
    this.chestPlacingAttempts = 10;
    this.chests = [];
    this.upStairCase;
    this.downStairCase;
};

Layer2Generator.prototype.generateLayer = function () {
    this.placeStairCases();
    this.placeChests();
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

Layer2Generator.prototype.placeChests = function () {
    for (i = 0; i < this.chestPlacingAttempts; i++) {
        var room = shuffle(layer1Generator.rooms)[0];
        var tile = shuffle(room.tiles)[0];

        if (!this.isOccupied(tile.yPos, tile.xPos)) {
            this.chests.push(new Chest(tile.yPos, tile.xPos));
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

    if (this.chests.filter(chest => (chest.yPos === yPos && chest.xPos === xPos)).length > 0) {
        return true;
    }

    return false;
};

Layer2Generator.prototype.getObject = function (yPos, xPos) {
    if(this.upStairCase.yPos === yPos && this.upStairCase.xPos === xPos) {
        return this.upStairCase;
    }

    if(this.downStairCase.yPos === yPos && this.downStairCase.xPos === xPos) {
        return this.downStairCase;
    }

    return this.chests.filter(chest => (chest.yPos === yPos && chest.xPos === xPos))[0];
}