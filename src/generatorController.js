/**
 * The generator controller orchestrates the different layer generators.
 */

 /**
  * NOTE: most of the non-generation related matter will be moved to a main manager in the future.
  */

var playerPosY, playerPosX;

/**
 * Sets the initial position of the player on the grid
 */
//TODO: this needs to be moved to a gen 3 layer generator
//TODO: prevent player of being spawned inside layer 2 objects
function setPlayerPos() {
    var pos = shuffle(roomOrigins)[0];

    playerPosY = pos.yPos;
    playerPosX = pos.xPos;
}

/**
 * Moves the player 1 tile in the direction given as a string.
 * @param {string} direction The direction in which to move the player.
 */
function movePlayer(direction) {
    switch (direction) {
        case 'UP':
            if (isTraverseable(playerPosY - 1, playerPosX))
                playerPosY--;
            break;
        case 'DOWN':
            if (isTraverseable(playerPosY + 1, playerPosX))
                playerPosY++;
            break;
        case 'LEFT':
            if (isTraverseable(playerPosY, playerPosX - 1))
                playerPosX--;
            break;
        case 'RIGHT':
            if (isTraverseable(playerPosY, playerPosX + 1))
                playerPosX++;
            break;
    }

    drawDisplay();
}

/**
 * Checks whether the given tile is traverseable by entities.
 * @param {int} y The row of the tile.
 * @param {int} x The column of the tile.
 * @returns {boolean} Whether this tile is traverseable or not.
 */
function isTraverseable(y, x) {
    if (y < 0 || y > rows || x < 0 || x > columns)
        return false;

    return (grid[y][x].symbol === '.');
}

/**
 * Initial function that generates the maze.
 * Gets called when the window is completely loaded.
 */
function initialize() {
    generateLayer1();
    generateLayer2();
    generateLayer3();

    setPlayerPos();
    drawDisplay();
};

window.addEventListener('load', initialize);
