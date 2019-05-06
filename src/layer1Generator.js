//TODO figure out a way to make this generator object stateless
//could be done by passing through variables and currying
//passing by reference is also possible for objects

var Layer1Generator = function () {
    this.rows = 40;
    this.columns = 150;

    this.grid = [];

    this.roomPlacingAttempts = 25;
    this.allowOverlappingRooms = true;

    this.maxRoomRows = 4;
    this.maxRoomColumns = 12;

    this.trimIterations = 20;

    //TODO: put roomOrigins in rooms as variable
    this.roomOrigins = [];
    this.rooms = [];
};

Layer1Generator.prototype.generateLayer = function () {
    this.generateLayout();

    //this is used to differentiate the differently created sections within the layer
    var currentID;
    currentID = this.placeRooms(currentID);
    currentID = this.floodFillMaze(currentID);
    this.mergeRooms();
    currentID = this.createConnections(currentID);
    this.trimends();
    this.removeUnneccesaryWalls();
};

/**
 * Generates the initial maze grid and fills it with walls.
 * @param {any} rows The number of rows (height) for the maze.
 * @param {any} columns The number of columns (width) for the maze.
 */
Layer1Generator.prototype.generateLayout = function () {
    this.grid = [];

    for (y = 0; y < this.rows; y++) {
        this.grid[y] = [];
        for (x = 0; x < this.columns; x++) {
            this.grid[y][x] = new Tile('#', -1);
        }
    }
};

Layer1Generator.prototype.placeRooms = function (id) {
    this.roomOrigins = [];
    id = 1;

    for (i = 0; i < this.roomPlacingAttempts; i++) {
        var roomRows = getRandomIntInclusive(2, this.maxRoomRows);
        var roomColumns = getRandomIntInclusive(2, this.maxRoomColumns);
        var randomRow = getRandomIntInclusive(1 + roomRows, this.rows - (2 + roomRows));
        var randomColumn = getRandomIntInclusive(1 + roomColumns, this.columns - (2 + roomColumns));

        this.roomOrigins.push({ xPos: randomColumn, yPos: randomRow });

        for (y = -roomRows; y <= roomRows; y++) {
            var yOffset = y + randomRow;
            if (yOffset <= 0 || yOffset >= this.rows - 1)
                continue;

            for (x = -roomColumns; x <= roomColumns; x++) {
                var xOffset = x + randomColumn;
                if (xOffset <= 0 || xOffset >= this.columns - 1)
                    continue;

                this.grid[yOffset][xOffset] = new Tile('.', id, true);
            }
        }
        id++;
    }

    return id;
};

Layer1Generator.prototype.floodFillMaze = function (id) {
    for (y = 1; y < this.rows - 1; y++) {
        xLoop:
        for (x = 1; x < this.columns - 1; x++) {
            if (this.grid[y][x].symbol === '#') {
                for (offSetY = -1; offSetY < 2; offSetY++) {
                    for (offSetX = -1; offSetX < 2; offSetX++) {
                        if (this.grid[y + offSetY][x + offSetX].symbol === '.') {
                            continue xLoop;
                        }
                    }
                }

                this.generatePassageWaysPrim(y, x, id);
                id++;
            }
        }
    }

    return id;
};

Layer1Generator.prototype.mergeRooms = function () {
    var traversedRoomtiles = [];

    for (y = 1; y < this.rows - 1; y++) {
        for (x = 1; x < this.columns - 1; x++) {

            if (this.grid[y][x].isRoom && !traversedRoomtiles.includes(this.grid[y][x])) {
                var lastID = this.grid[y][x].regionId;
                var tiles = [];

                var currentRoom = new RoomData(lastID);

                tiles.push(new RoomDataTile(y, x));

                while (tiles.length > 0) {
                    var tile = tiles.pop();

                    if (this.grid[tile.yPos][tile.xPos].isRoom && !traversedRoomtiles.includes(this.grid[tile.yPos][tile.xPos])) {
                        this.grid[tile.yPos][tile.xPos].regionId = lastID;

                        currentRoom.tiles.push(tile);

                        tiles.push({ yPos: tile.yPos + 1, xPos: tile.xPos });
                        tiles.push({ yPos: tile.yPos - 1, xPos: tile.xPos });
                        tiles.push({ yPos: tile.yPos, xPos: tile.xPos + 1 });
                        tiles.push({ yPos: tile.yPos, xPos: tile.xPos - 1 });
                    }

                    traversedRoomtiles.push(this.grid[tile.yPos][tile.xPos]);
                }

                this.rooms.push(currentRoom);
            }
        }
    }
};

Layer1Generator.prototype.createConnections = function (id) {
    var connections = [];

    for (y = 1; y < this.rows - 1; y++) {
        for (x = 1; x < this.columns - 1; x++) {
            if (this.grid[y][x].symbol === '#') {
                var firstRegion = this.grid[y - 1][x];
                var secondRegion = this.grid[y + 1][x];

                if (firstRegion.symbol === '.' && secondRegion.symbol === '.' && firstRegion.regionId !== secondRegion.regionId) {
                    connections.push({ xPos: x, yPos: y, firstId: firstRegion.regionId, secondId: secondRegion.regionId, newId: !firstRegion.isRoom ? firstRegion.regionId : secondRegion.regionId });
                    continue;
                }

                firstRegion = this.grid[y][x - 1];
                secondRegion = this.grid[y][x + 1];

                if (firstRegion.symbol === '.' && secondRegion.symbol === '.' && firstRegion.regionId !== secondRegion.regionId) {
                    connections.push({ xPos: x, yPos: y, firstId: firstRegion.regionId, secondId: secondRegion.regionId, newId: !firstRegion.isRoom ? firstRegion.regionId : secondRegion.regionId });
                    continue;
                }
            }
        }
    }

    while (connections.length > 0) {
        connections = shuffle(connections);

        var filteredconn = shuffle(connections.filter(entry =>
            entry.firstId === connections[0].firstId && entry.secondId === connections[0].secondId ||
                entry.firstId === connections[0].secondId && entry.secondId === connections[0].firstId));

        var increment = 1;
        for (i = 0; i < 3; i++) {
            if (i >= filteredconn.length) {
                break;
            }

            var numOfFloors = 0;
            for (let yOffset = -1; yOffset < 2; yOffset++) {
                for (let xOffset = -1; xOffset < 2; xOffset++) {
                    if (yOffset === xOffset || yOffset === -xOffset) {
                        continue;
                    }
                    if (this.grid[filteredconn[i].yPos + yOffset][filteredconn[i].xPos + xOffset].symbol === '.') {
                        numOfFloors++;
                    }
                }
            }
            if (numOfFloors > 2) {
                break;
            }

            var rnd = Math.random();
            if (rnd > increment) {
                break;
            }
            increment -= 0.33;

            //add some randomness in here
            this.grid[filteredconn[i].yPos][filteredconn[i].xPos] = new Tile('.', filteredconn[i].newId, false);
        }

        connections = connections.filter(entry => !filteredconn.includes(entry));
    }

    return id;
};

Layer1Generator.prototype.trimends = function () {
    for (i = 0; i < this.trimIterations; i++) {
        var addedWalls = [];

        for (y = 1; y < this.rows - 1; y++) {
            for (x = 1; x < this.columns - 1; x++) {
                if (this.grid[y][x].symbol === '.') {
                    var neighbouringWalls = 0;

                    offsetLoop:
                    for (offSetY = -1; offSetY < 2; offSetY++) {
                        for (offSetX = -1; offSetX < 2; offSetX++) {

                            if (offSetY === offSetX || offSetY === -offSetX)
                                continue;

                            if (this.grid[y + offSetY][x + offSetX].symbol === '#') {
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
            this.grid[addedWalls[j][0]][addedWalls[j][1]] = new Tile('#', -1, false);
        }
    }
};

//TODO this can look better
Layer1Generator.prototype.generatePassageWaysPrim = function (yStartPos, xStartpos, id) {
    var walls = [];
    this.grid[yStartPos][xStartpos] = new Tile('.', id, false);

    if (yStartPos - 1 > 0)
        walls.push([yStartPos - 1, xStartpos, 'UP']); // upper wall

    if (yStartPos + 1 < this.rows - 1)
        walls.push([yStartPos + 1, xStartpos, 'DOWN']); // lower wall

    if (xStartpos - 1 > 0)
        walls.push([yStartPos, xStartpos - 1, 'LEFT']); // left wall

    if (xStartpos + 1 < this.columns - 1)
        walls.push([yStartPos, xStartpos + 1, 'RIGHT']); // right wall

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

                if (randomWall[0] + y < 1 || randomWall[0] + y > this.rows - 2)
                    continue;

                if (randomWall[1] + x < 1 || randomWall[1] + x > this.columns - 2)
                    continue;

                if (this.grid[randomWall[0] + y][randomWall[1] + x].symbol === '.') {
                    createPassage = false;
                }
            }
        }

        if (createPassage) {
            this.grid[randomWall[0]][randomWall[1]] = new Tile('.', id, false);

            switch (randomWall[2]) {
                case 'UP': // dont add bottom wall
                    if (randomWall[0] - 1 > 0) // upper wall
                        walls.push([randomWall[0] - 1, randomWall[1], 'UP']);
                    if (randomWall[1] - 1 > 0) // left wall
                        walls.push([randomWall[0], randomWall[1] - 1, 'LEFT']);
                    if (randomWall[1] + 1 < this.columns - 1) // right wall
                        walls.push([randomWall[0], randomWall[1] + 1, 'RIGHT']);
                    break;

                case 'DOWN': // dont add upper wall
                    if (randomWall[0] + 1 < this.rows - 1) // lower wall
                        walls.push([randomWall[0] + 1, randomWall[1], 'DOWN']);
                    if (randomWall[1] - 1 > 0) // left wall
                        walls.push([randomWall[0], randomWall[1] - 1, 'LEFT']);
                    if (randomWall[1] + 1 < this.columns - 1) // right wall
                        walls.push([randomWall[0], randomWall[1] + 1, 'RIGHT']);
                    break;

                case 'LEFT': // dont add right wall
                    if (randomWall[0] - 1 > 0) // upper wall
                        walls.push([randomWall[0] - 1, randomWall[1], 'UP']);
                    if (randomWall[0] + 1 < this.rows - 1) // lower wall
                        walls.push([randomWall[0] + 1, randomWall[1], 'DOWN']);
                    if (randomWall[1] - 1 > 0) // left wall
                        walls.push([randomWall[0], randomWall[1] - 1, 'LEFT']);
                    break;

                case 'RIGHT': // dont add left wall
                    if (randomWall[0] - 1 > 0) // upper wall
                        walls.push([randomWall[0] - 1, randomWall[1], 'UP']);
                    if (randomWall[0] + 1 < this.rows - 1) // lower wall
                        walls.push([randomWall[0] + 1, randomWall[1], 'DOWN']);
                    if (randomWall[1] + 1 < this.columns - 1) // right wall
                        walls.push([randomWall[0], randomWall[1] + 1, 'RIGHT']);
                    break;
            }
        }
        walls.splice(randomIndex, 1);
    }
};

Layer1Generator.prototype.removeUnneccesaryWalls = function () {
    for (y = 0; y < this.rows; y++) {
        outerXLoop:
        for (x = 0; x < this.columns; x++) {

            if (this.grid[y][x].symbol === '#') {
                for (offSetY = -1; offSetY < 2; offSetY++) {
                    if (y + offSetY < 0 || y + offSetY >= this.rows)
                        continue;

                    for (offSetX = -1; offSetX < 2; offSetX++) {
                        if (x + offSetX < 0 || x + offSetX >= this.columns)
                            continue;

                        if (this.grid[y + offSetY][x + offSetX].symbol === '.')
                            continue outerXLoop;
                    }
                }
                this.grid[y][x].symbol = ' ';
            }
        }
    }
};