const chestPlacingAttempts = 10;

var chests = [];

var upStairCase;
var downStairCase;

//TODO: currently not used, but could this be subclasses from a base tile class which holds the yPos and xPos value?
function Chest(yPos, xPos) {
    this.yPos = yPos;
    this.xPos = xPos;

    //some other smuck, like what it contains, etc...
}

function generateLayer2() {
    console.log("generating second layer");
    placeStairCases();
    placeChests();
}

/**
 * Helper function to tell if a tile is already occupied by a layer 2 entity.
 * 
 * @param {int} yPos The y position of the tile.
 * @param {int} xPos The x position of the tile.
 */
function isOccupied(yPos, xPos) {

    if(upStairCase !== undefined && upStairCase.yPos === yPos && upStairCase.xPos === xPos) {
        return true;
    }

    if(downStairCase !== undefined && downStairCase.yPos === yPos && downStairCase.xPos === xPos) {
        return true;
    }

    if(chests.filter(chest => (chest.yPos === yPos && chest.xPos === xPos)).length > 0) {
        return true;
    }

    return false;
}

/**
 * Simple chest placing function which will, in a loop:
 * Take a random room.
 * Take a random tile from this room.
 * If it is not occupied yet, place a chest here.
 * 
 * Later, this can be upgraded to take into account the size of rooms, which could be picked more often
 */
function placeChests() {
    for(i = 0; i < chestPlacingAttempts; i++){
        var room = shuffle(rooms)[0];
        var tile = shuffle(room.tiles)[0];

        if(!isOccupied(tile.yPos, tile.xPos)) {
            chests.push(tile);
        }
    }
}

/**
 * Simple staircase placing function which will:
 * Take a random room.
 * Take all corner tiles from this room.
 * Place a staircase on one of these tiles.
 */
function placeStairCases() {
    function getCornerTilesFromRoom(room) {
        return room.tiles.filter(tile => {
            var neighbouringWalls = 0;
            for (offSetY = -1; offSetY < 2; offSetY++) {
                for (offSetX = -1; offSetX < 2; offSetX++) {
    
                    if (offSetY === offSetX || offSetY === -offSetX)
                        continue;
    
                    if (grid[tile.yPos + offSetY][tile.xPos + offSetX].symbol === '#') {
                        neighbouringWalls++;
                        if (neighbouringWalls >= 2) {
                            return true;
                        }
                    }
                }
            }
        });
    }

    var firstRoom = shuffle(rooms)[0];
    var firstRoomCornerTiles = getCornerTilesFromRoom(firstRoom);

    var secondRoom = shuffle(rooms)[0];
    var secondRoomCornerTiles = getCornerTilesFromRoom(secondRoom);

    upStairCase = shuffle(firstRoomCornerTiles)[0];
    // For the down staircase we do an extra filter to make sure there's no possibility of putting both staircases on the same tile.
    downStairCase = shuffle(secondRoomCornerTiles).filter(tile => tile !== upStairCase)[0];
}