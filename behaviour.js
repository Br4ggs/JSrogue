/**
 * Tiles consist of the following data structure:
 *  {
 *      symbol: 'the ascii character that will be displayed on-screen',
 *      id: 'the id of the region of tiles, used during the generation process and maybe later for other stuff(?)',
 *      isRoom: 'used to determine rooms within the maze'
 *  }

/**
 * The maximum amount of attemts the generator will do for placing rooms.
 * */
const roomPlacingAttempts = 25;
const allowOverlappingRooms = true;
// TODO: rename these to columns and rows
const maxRoomHeight = 4; // Y axis
const maxRoomWidth = 12; // X axis

const trimIterations = 5;

const rows = 40;     // Y axis
const columns = 150; // X axis

/**
 * The grid itself, is a 2D array.
 * */
var grid;

/**
 * Integer used for determining different regions of the dungeon.
 * Used during generation only.
 * */
// TODO: see if this field can be removed in favor of dependency injection in each method where its needed
var currentID;

var playerPosY, playerPosX;

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * @param {int} min The minimum bottom for the range (inclusive).
 * @param {int} max The maximum top for the range (inclusive).
 * @returns {int} the newly created integer.
 */
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Scrambles an array to randomize it.
 * @param {any} array The array to shuffle.
 * @returns the shuffled array.
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * Merges rooms which where placed in one-another into one big room.
 * the ID of the new room will be the one first encountered during iteration.
 */
function mergeRooms() {
    var traversedRoomtiles = [];

    for (y = 1; y < rows - 1; y++) {
        for (x = 1; x < columns - 1; x++) {

            if (grid[y][x].isRoom && !traversedRoomtiles.includes(grid[y][x])) {
                var lastID = grid[y][x].id;
                var tiles = [];

                tiles.push({ yPos: y, xPos: x });

                while (tiles.length > 0) {
                    var tile = tiles.pop();

                    if (grid[tile.yPos][tile.xPos].isRoom && !traversedRoomtiles.includes(grid[tile.yPos][tile.xPos])) {
                        grid[tile.yPos][tile.xPos].id = lastID;

                        tiles.push({ yPos: tile.yPos + 1, xPos: tile.xPos });
                        tiles.push({ yPos: tile.yPos - 1, xPos: tile.xPos });
                        tiles.push({ yPos: tile.yPos, xPos: tile.xPos + 1 });
                        tiles.push({ yPos: tile.yPos, xPos: tile.xPos - 1 });
                    }

                    traversedRoomtiles.push(grid[tile.yPos][tile.xPos]);
                }
            }
        }
    }
}

/**
 * Tries to place rooms of random size on random positions in the grid based on the amount of room placing attemtps.
 */
function placeRooms() {
    currentID = 1;
    for (i = 0; i < roomPlacingAttempts; i++) {

        var roomHeight = getRandomIntInclusive(2, maxRoomHeight);
        var roomWidth = getRandomIntInclusive(2, maxRoomWidth);
        var randomRow = getRandomIntInclusive(1 + roomHeight, rows - (2 + roomHeight));
        var randomColumn = getRandomIntInclusive(1 + roomWidth, columns - (2 + roomWidth));

        for (y = -roomHeight; y <= roomHeight; y++) {
            var yOffset = y + randomRow;
            if (yOffset <= 0 || yOffset >= rows - 1)
                continue;

            for (x = -roomWidth; x <= roomWidth; x++) {
                var xOffset = x + randomColumn;
                if (xOffset <= 0 || xOffset >= columns - 1)
                    continue;

                if (grid[yOffset][xOffset].symbol !== 'X')
                    grid[yOffset][xOffset] = { symbol: '.', id: currentID, isRoom: true };
            }
        }
        currentID++;
    }
}

/**
 * Iterates through every tile of the maze.
 * When it find a wall tile in the maze, it will check its adjacent tiles.
 * If these are also wall tiles, it will run the passageway generator.
 * It iterates through the maze filling all spaces in the maze, untill no more maze can be generated.
 */
function floodFillMaze() {
    for (y = 1; y < rows - 1; y++) {
        xLoop:
        for (x = 1; x < columns - 1; x++) {
            if (grid[y][x].symbol === '#') {
                for (offSetY = -1; offSetY < 2; offSetY++) {
                    for (offSetX = -1; offSetX < 2; offSetX++) {
                        if (grid[y + offSetY][x + offSetX].symbol === '.') {
                            continue xLoop;
                        }
                    }
                }

                generatePassageWaysPrim(y, x);
                currentID++;
            }
        }
    }
}

/**
 * Creates the passages ways via the prim algorithm.
 * @param {int} row The position to start generating from (Y).
 * @param {int} column The position to start generating from (X).
 */
// TODO: reduce method size if possible
function generatePassageWaysPrim(row, column) {

    var walls = [];
    grid[row][column] = { symbol: '.', id: currentID, isRoom: false };

    if (row - 1 > 0)
        walls.push([row - 1, column, 'UP']); // upper wall

    if (row + 1 < rows - 1)
        walls.push([row + 1, column, 'DOWN']); // lower wall

    if (column - 1 > 0)
        walls.push([row, column - 1, 'LEFT']); // left wall

    if (column + 1 < columns - 1)
        walls.push([row, column + 1, 'RIGHT']); // right wall

    while (walls.length > 0) {
        var randomIndex = getRandomIntInclusive(0, walls.length - 1);
        var randomWall = walls[randomIndex];

        var yStart;
        var xStart;

        var yMax;
        var xMax;

        switch (randomWall[2]) {
            case 'UP': // -1, 0
                yStart = -1;    //  X X X
                xStart = -1;    //  X W X
                yMax = 0;       //  # . #
                xMax = 1;
                break;

            case 'DOWN': // 1, 0
                yStart = 0;     //  # . #
                xStart = -1;    //  X W X
                yMax = 1;       //  X X X
                xMax = 1;
                break;

            case 'LEFT': // 0, -1
                yStart = -1;    // X X #
                xStart = -1;    // X W .
                yMax = 1;       // X X #
                xMax = 0;
                break;

            case 'RIGHT': // 0, 1
                yStart = -1;    // # X X
                xStart = 0;     // . W X
                yMax = 1;       // # X X
                xMax = 1;
                break;
        }

        var createPassage = true;
        for (y = yStart; y <= yMax; y++) {
            for (x = xStart; x <= xMax; x++) {
                if (y === 0 && x === 0)
                    continue;

                if (randomWall[0] + y < 1 || randomWall[0] + y > rows - 2)
                    continue;

                if (randomWall[1] + x < 1 || randomWall[1] + x > columns - 2)
                    continue;

                if (grid[randomWall[0] + y][randomWall[1] + x].symbol === '.') {
                    createPassage = false;
                }
            }
        }

        if (createPassage) {
            grid[randomWall[0]][randomWall[1]] = { symbol: '.', id: currentID, isRoom: false };

            switch (randomWall[2]) {
                case 'UP': // dont add bottom wall
                    if (randomWall[0] - 1 > 0) // upper wall
                        walls.push([randomWall[0] - 1, randomWall[1], 'UP']);
                    if (randomWall[1] - 1 > 0) // left wall
                        walls.push([randomWall[0], randomWall[1] - 1, 'LEFT']);
                    if (randomWall[1] + 1 < columns - 1) // right wall
                        walls.push([randomWall[0], randomWall[1] + 1, 'RIGHT']);
                    break;

                case 'DOWN': // dont add upper wall
                    if (randomWall[0] + 1 < rows - 1) // lower wall
                        walls.push([randomWall[0] + 1, randomWall[1], 'DOWN']);
                    if (randomWall[1] - 1 > 0) // left wall
                        walls.push([randomWall[0], randomWall[1] - 1, 'LEFT']);
                    if (randomWall[1] + 1 < columns - 1) // right wall
                        walls.push([randomWall[0], randomWall[1] + 1, 'RIGHT']);
                    break;

                case 'LEFT': // dont add right wall
                    if (randomWall[0] - 1 > 0) // upper wall
                        walls.push([randomWall[0] - 1, randomWall[1], 'UP']);
                    if (randomWall[0] + 1 < rows - 1) // lower wall
                        walls.push([randomWall[0] + 1, randomWall[1], 'DOWN']);
                    if (randomWall[1] - 1 > 0) // left wall
                        walls.push([randomWall[0], randomWall[1] - 1, 'LEFT']);
                    break;

                case 'RIGHT': // dont add left wall
                    if (randomWall[0] - 1 > 0) // upper wall
                        walls.push([randomWall[0] - 1, randomWall[1], 'UP']);
                    if (randomWall[0] + 1 < rows - 1) // lower wall
                        walls.push([randomWall[0] + 1, randomWall[1], 'DOWN']);
                    if (randomWall[1] + 1 < columns - 1) // right wall
                        walls.push([randomWall[0], randomWall[1] + 1, 'RIGHT']);
                    break;
            }
        }
        walls.splice(randomIndex, 1);
    }
}

/**
 * Trim dead endings from the maze.
 * A dead ending is a floor tile which is surrounded by 3 wall tiles.
 * The amount of trim is dependent on the specified amount of trim iterations.
 */
function trimends() {
    for (i = 0; i < trimIterations; i++) {
        var addedWalls = [];

        for (y = 1; y < rows - 1; y++) {
            for (x = 1; x < columns - 1; x++) {
                if (grid[y][x].symbol === '.') {
                    var neighbouringWalls = 0;

                    offsetLoop:
                    for (offSetY = -1; offSetY < 2; offSetY++) {
                        for (offSetX = -1; offSetX < 2; offSetX++) {

                            if (offSetY === offSetX || offSetY === -offSetX)
                                continue;

                            if (grid[y + offSetY][x + offSetX].symbol === '#') {
                                neighbouringWalls++;
                                if (neighbouringWalls >= 3) {
                                    addedWalls.push([y, x]);
                                    break offsetLoop;
                                }
                            }
                        }
                    }
                }
            }
        }

        for (j = 0; j < addedWalls.length; j++) {
            grid[addedWalls[j][0]][addedWalls[j][1]] = { symbol: '#', id: -1, isRoom: false };
        }
    }
}

/**
 * Looks for possible connections and marks them as %.
 * A connection is a wall which is turned into a floor tile when
 * it is surrounded by 2 floor tiles with a different ID.
 * */
function createConnections() {
    var connections = [];

    for (y = 1; y < rows - 1; y++) {
        xLoop:
        for (x = 1; x < columns - 1; x++) {
            if (grid[y][x].symbol === '#') {
                var firstRegion = grid[y - 1][x];
                var secondRegion = grid[y + 1][x];

                if (firstRegion.symbol === '.' && secondRegion.symbol === '.' && firstRegion.id !== secondRegion.id) {
                    connections.push({ xPos: x, yPos: y, firstId: firstRegion.id, secondId: secondRegion.id });
                    continue xLoop;
                }

                firstRegion = grid[y][x - 1];
                secondRegion = grid[y][x + 1];

                if (firstRegion.symbol === '.' && secondRegion.symbol === '.' && firstRegion.id !== secondRegion.id) {
                    connections.push({ xPos: x, yPos: y, firstId: firstRegion.id, secondId: secondRegion.id });
                    continue xLoop;
                }
            }
        }
    }

    while (connections.length > 0) {
        connections = shuffle(connections);

        var filteredconn = shuffle(connections.filter(entry =>
            (entry.firstId === connections[0].firstId && entry.secondId === connections[0].secondId ||
                entry.firstId === connections[0].secondId && entry.secondId === connections[0].firstId)));

        console.log(filteredconn.length);
        //get a list of the connections with the desired id's
        //shuffle this list
        //pick the first X amount from it. you could randomize this by chance
        //then filter all connections with desired id's from total list
        var increment = 1;
        for (i = 0; i < 3; i++) {
            if (i >= filteredconn.length) {
                break;
            }

            var rnd = Math.random();
            if (rnd > increment) {
                break;
            }
            increment -= 0.33;

            //add some randomness in here

            grid[filteredconn[i].yPos][filteredconn[i].xPos] = { symbol: '.', id: currentID, isRoom: false }; //or could give this a 'door' identity
        }
        currentID++;

        //the || statement is for when the id's are still the same but are swapped when finding connections horizonally vs vertically
        //you can remove the part after the || operator if you'd like a couple more openings
        //or for something more controlled, try a couple more connectors of the same ID before filtering them all out
        connections = connections.filter(entry => !filteredconn.includes(entry));
    }
}

/**
 * Generates the initial maze grid and fills it with walls.
 * @returns The 2D maze grid.
 */
function generateLayout() {
    var grid = [];

    for (y = 0; y < rows; y++) {
        grid[y] = [];
        for (x = 0; x < columns; x++) {
            grid[y][x] = { symbol: '#', id: -1 };
        }
    }

    return grid;
}

/**
 * Sets the initial position of the player on the grid
 */
function setPlayerPos() {
    playerPosY = 1;
    playerPosX = 1;
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

    return grid[y][x] === '.';
}

/**
 * Display the current grid and the entities in it on the page.
 */
function drawDisplay() {
    var display = [];

    for (y = 0; y < rows; y++) {
        display[y] = [];
        for (x = 0; x < columns; x++) {
            display[y][x] = grid[y][x].symbol;
        }
    }

    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');
}

/**
 * Initial function that generates the maze.
 * Gets called when the window is completely loaded.
 */
window.onload = function () {
    grid = generateLayout();
    placeRooms();
    floodFillMaze();
    mergeRooms();
    createConnections();
    trimends();
    drawDisplay();
    document.onkeydown = function (e) {
        switch (String.fromCharCode(e.keyCode)) {
            case 'W':
                movePlayer('UP');
                break;
            case 'A':
                movePlayer('LEFT');
                break;
            case 'S':
                movePlayer('DOWN');
                break;
            case 'D':
                movePlayer('RIGHT');
                break;
        }
    };
};
