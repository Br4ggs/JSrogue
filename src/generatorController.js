/**
 * The generator controller orchestrates the different layer generators.
 */

 /**
  * NOTE: most of the non-generation related matter will be moved to a main manager in the future.
  */
var layer1Generator = new Layer1Generator();
var layer2Generator = new Layer2Generator();
var layer3Generator = new Layer3Generator();

/**
 * Checks whether the given tile is traverseable by entities.
 * @param {int} y The row of the tile.
 * @param {int} x The column of the tile.
 * @returns {boolean} Whether this tile is traverseable or not.
 */
function isTraverseable(y, x) {
    if (y < 0 || y > layer1Generator.rows - 1 || x < 0 || x > layer1Generator.columns - 1)
        return false;

    if (layer2Generator.isOccupied(y, x)) {
        var object = layer2Generator.getObject(y, x);
        if (object instanceof Door) {
            return object.open;
        }

        if (object instanceof StairCase) {
            return false;
        }
    }

    //TODO: tiles should have a field for this, shouldn't be dependant on symbol
    return layer1Generator.grid[y][x].symbol === '.';
}

function isOpaque(y, x) {
    if (y < 0 || y > layer1Generator.rows - 1 || x < 0 || x > layer1Generator.columns - 1)
    return false;

    if (layer2Generator.isOccupied(y, x)) {
        var object = layer2Generator.getObject(y, x);
        if (object instanceof Door) {
            return object.isOpaque();
        }
    }

    return layer1Generator.grid[y][x].symbol === '#';
}

/**
 * Initial function that generates the maze.
 * Gets called when the window is completely loaded.
 */
function generateLevel() {
    layer1Generator.generateLayer();
    layer2Generator.generateLayer();
    layer3Generator.generateLayer();

    drawDisplay();
    drawHealthIndicator();
}

//Really lazy but this is gonna get overhauled anyway
function nextLevel() {
    const playerData = layer3Generator.player;
    layer1Generator = new Layer1Generator();
    layer2Generator = new Layer2Generator();
    layer3Generator = new Layer3Generator();

    generateLevel();

    layer3Generator.player.id = playerData.id;
    layer3Generator.player.health = playerData.health;
    layer3Generator.player.gold = playerData.gold;
    writeToConsole("The staircase locks behind you.");
}

function restart() {
    layer1Generator = new Layer1Generator();
    layer2Generator = new Layer2Generator();
    layer3Generator = new Layer3Generator();
    generateLevel();
    setMoveMode();
}

window.addEventListener('load', generateLevel);
