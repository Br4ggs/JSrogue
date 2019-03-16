const chestPlacingAttempts = 10;

var chests = [];

function Chest(yPos, xPos) {
    this.yPos = yPos;
    this.xPos = xPos;

    //some other smuck, like what it contains, etc...
}

function generateLayer2() {
    console.log("generating second layer");
    placeChests();
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