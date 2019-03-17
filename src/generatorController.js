/**
 * The generator controller orchestrates the different layer generators.
 */

 /**
  * NOTE: most of the non-generation related matter will be moved to a main manager in the future.
  */

var playerPosY, playerPosX;

/**
 * Generates the initial maze grid and fills it with walls.
 * @returns The maze grid as a 2d array.
 */
function generateLayout() {
    var grid = [];

    for (y = 0; y < rows; y++) {
        grid[y] = [];
        for (x = 0; x < columns; x++) {
            grid[y][x] = new Tile('#', -1);
        }
    }

    return grid;
}

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

    //TODO: prevent player from walking on chests and other stuff from layer 2
    return grid[y][x].symbol === '.';
}

/**
 * Display the current grid and the entities in it on the page.
 */
//TODO: move to separate ui module
function drawDisplay() {
    var display = [];

    for (y = 0; y < rows; y++) {
        display[y] = [];
        for (x = 0; x < columns; x++) {
            display[y][x] = grid[y][x].symbol;
        }
    }

    //TODO: call some sort of helper method that collects all objects of layer 2
    chests.forEach(chest => {
        display[chest.yPos][chest.xPos] = 'C';
    });

    display[upStairCase.yPos][upStairCase.xPos] = 'U';
    display[downStairCase.yPos][downStairCase.xPos] = 'D';

    display[playerPosY][playerPosX] = '@';
    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');
}

/**
 * Initial function that generates the maze.
 * Gets called when the window is completely loaded.
 */
function initialize() {
    grid = generateLayout();

    generateLayer1();
    generateLayer2();
    generateLayer3();

    setPlayerPos();
    drawDisplay();
};

window.addEventListener('load', initialize);
