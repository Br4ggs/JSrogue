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
    if (y < 0 || y > layer1Generator.rows || x < 0 || x > layer1Generator.columns)
        return false;

    return layer1Generator.grid[y][x].symbol === '.';
}

/**
 * Initial function that generates the maze.
 * Gets called when the window is completely loaded.
 */
function initialize() {
    layer1Generator.generateLayer();
    layer2Generator.generateLayer();
    layer3Generator.generateLayer();

    drawDisplay();
}

window.addEventListener('load', initialize);
