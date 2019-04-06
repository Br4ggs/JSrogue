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

    this.upStairCase = shuffle(firstRoomCornerTiles)[0];
    // For the down staircase we do an extra filter to make sure there's no possibility of putting both staircases on the same tile.
    this.downStairCase = shuffle(secondRoomCornerTiles)
        .filter(tile => tile !== this.upStairCase)[0];
};

//TODO return value of chests array?
Layer2Generator.prototype.placeChests = function () {
    for (i = 0; i < this.chestPlacingAttempts; i++) {
        var room = shuffle(layer1Generator.rooms)[0];
        var tile = shuffle(room.tiles)[0];

        if (!this.isOccupied(tile.yPos, tile.xPos)) {
            this.chests.push(tile);
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

//TODO: currently not used, but could this be subclasses from a base tile class which holds the yPos and xPos value?
//function Chest(yPos, xPos) {
//    this.yPos = yPos;
//    this.xPos = xPos;

//    //some other smuck, like what it contains, etc...
//}