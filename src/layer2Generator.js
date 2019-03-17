const chestPlacingAttempts = 10;

var chests = [];

var upStairCase;
var downStairCase;

function Chest(yPos, xPos) {
    this.yPos = yPos;
    this.xPos = xPos;

    //some other smuck, like what it contains, etc...
}

function generateLayer2() {
    console.log("generating second layer");
    placeChests();
    placeStairCases();
}

//TODO: create helper method to check if something on this level occupies a specific tile
function isOccupied(yPos, xPos) {

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

        if(!chests.includes(tile)) {
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

    //TODO: use helper method to prevent placing staircase on chest, or another staircase
    upStairCase = shuffle(firstRoomCornerTiles)[0];
    downStairCase = shuffle(secondRoomCornerTiles)[0];
}