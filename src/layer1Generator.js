// move all generation logic to here
// TODO: construct all tiles via constructor function

const rows = 40;     // Y axis
const columns = 150; // X axis

/**
 * The grid itself, is a 2D array.
 */
var grid;

/**
 * The maximum amount of attemts the generator will do for placing rooms.
 * */
const roomPlacingAttempts = 25;
const allowOverlappingRooms = true;

const maxRoomRows = 4; // Y axis
const maxRoomColumns = 12; // X axis

const trimIterations = 5;

var roomOrigins;

// This will contain:
// An array of all the rooms
// Each room will have a list of all the tiles that make up that room
var rooms = [];

/**
 * Representation of a room which consists of it's ID and the corresponding tiles.
 * 
 * @param {int} ID The ID of this room.
 */
function RoomData(ID) {
    this.ID = ID
    this.tiles = []
}

/**
 * Represents a tile belonging to a room in the RoomData tile array.
 * 
 * @param {int} yPos The Y position of the tile on the grid.
 * @param {int} xPos The X position of the tile on the grid.
 */
function RoomDataTile(yPos, xPos) {
    this.yPos = yPos;
    this.xPos = xPos;
}

/**
 * Integer used for determining different regions of the dungeon.
 * Used during generation only.
 * */
// TODO: see if this field can be removed in favor of dependency injection in each method where its needed
var currentID;

function generateLayer1() {
    console.log("generating first layer");

    placeRooms();
    floodFillMaze();
    mergeRooms();
    createConnections();
    trimends();

    console.log("rooms is " + rooms.length + " long");
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

                var currentRoom = new RoomData(lastID);

                tiles.push(new RoomDataTile(y, x));

                while (tiles.length > 0) {
                    var tile = tiles.pop();

                    if (grid[tile.yPos][tile.xPos].isRoom && !traversedRoomtiles.includes(grid[tile.yPos][tile.xPos])) {
                        grid[tile.yPos][tile.xPos].id = lastID;

                        currentRoom.tiles.push(tile);

                        tiles.push({ yPos: tile.yPos + 1, xPos: tile.xPos });
                        tiles.push({ yPos: tile.yPos - 1, xPos: tile.xPos });
                        tiles.push({ yPos: tile.yPos, xPos: tile.xPos + 1 });
                        tiles.push({ yPos: tile.yPos, xPos: tile.xPos - 1 });
                    }

                    traversedRoomtiles.push(grid[tile.yPos][tile.xPos]);
                }

                rooms.push(currentRoom);
            }
        }
    }
}

/**
 * Tries to place rooms of random size on random positions in the grid based on the amount of room placing attemtps.
 */
function placeRooms() {
    roomOrigins = [];
    currentID = 1;
    for (i = 0; i < roomPlacingAttempts; i++) {

        var roomRows = getRandomIntInclusive(2, maxRoomRows);
        var roomColumns = getRandomIntInclusive(2, maxRoomColumns);
        var randomRow = getRandomIntInclusive(1 + roomRows, rows - (2 + roomRows));
        var randomColumn = getRandomIntInclusive(1 + roomColumns, columns - (2 + roomColumns));

        roomOrigins.push({ xPos: randomColumn, yPos: randomRow });

        for (y = -roomRows; y <= roomRows; y++) {
            var yOffset = y + randomRow;
            if (yOffset <= 0 || yOffset >= rows - 1)
                continue;

            for (x = -roomColumns; x <= roomColumns; x++) {
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