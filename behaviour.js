const roomPlacingAttempts = 20;
const maxRoomHeight = 4; // Y axis
const maxRoomWidth = 12; // X axis

const trimIterations = 10;

const rows = 40; // Y axis
const columns = 150; // X axis
var grid;

var playerPosY, playerPosX;

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeRooms() {
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

                if (grid[yOffset][xOffset] !== 'X')
                    grid[yOffset][xOffset] = '.';
            }
        }

        grid[randomRow][randomColumn] = 'X';
    }
}

//add method which iterates over grid and creates passages if enough wall in one place is found
function floodFillMaze() {
    for (y = 1; y < rows - 1; y++) {
        xLoop:
        for (x = 1; x < columns - 1; x++) {
            if (grid[y][x] === '#') {
                for (offSetY = -1; offSetY < 2; offSetY++) {
                    for (offSetX = -1; offSetX < 2; offSetX++) {
                        if (grid[y + offSetY][x + offSetX] === '.') {
                            continue xLoop;
                        }
                    }
                }

                generatePassageWaysPrim(y, x);
            }
        }
    }
}

//add argument for start point
function generatePassageWaysPrim(row, column) {
    //var randomRow = getRandomIntInclusive(1 , rows - 2);
    //var randomColumn = getRandomIntInclusive(1, columns - 2);

    var walls = []; //add wall coordinates to this: [Y coordinate on grid, X coordinate on grid, direction in relation to origin]

    grid[row][column] = '.';

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

                if (grid[(randomWall[0] + y)][(randomWall[1] + x)] === '.') {
                    createPassage = false;
                }
            }
        }

        if (createPassage) {
            grid[randomWall[0]][randomWall[1]] = '.';

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

function trimends() {
    for (i = 0; i < trimIterations; i++) {
        var addedWalls = [];

        for (y = 1; y < rows - 1; y++) {
            for (x = 1; x < columns - 1; x++) {
                if (grid[y][x] === '.') {
                    var neighbouringWalls = 0;

                    offsetLoop:
                    for (offSetY = -1; offSetY < 2; offSetY++) {
                        for (offSetX = -1; offSetX < 2; offSetX++) {

                            if (offSetY === offSetX || offSetY === -offSetX)
                                continue;

                            if (grid[y + offSetY][x + offSetX] === '#') {
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
            grid[addedWalls[j][0]][addedWalls[j][1]] = '#';
        }
    }
}

function generateLayout() {
    var grid = [];

    for (y = 0; y < rows; y++) {
        grid[y] = [];
        for (x = 0; x < columns; x++) {
            grid[y][x] = '#';
        }
    }

    return grid;
}

function setPlayerPos() {
    playerPosY = 1;
    playerPosX = 1;
}

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

function isTraverseable(y, x) {
    if (y < 0 || y > rows || x < 0 || x > columns)
        return false;

    return grid[y][x] === '.';
}

function drawDisplay() {
    var display = [];

    for (y = 0; y < rows; y++) {
        display[y] = [];
        for (x = 0; x < columns; x++) {
            //if (playerPosY === y && playerPosX === x)
                //display[y][x] = '@';
            //else
                display[y][x] = grid[y][x];
        }
    }

    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');
}

window.onload = function () {
    grid = generateLayout();
    setPlayerPos();
    placeRooms();
    //update the creation of passageways so it always generates something for the entire grid.
    //generatePassageWaysPrim();
    floodFillMaze();
    //trimends();
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
