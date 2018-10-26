const attempts = 10;
const maxRoomHeight = 4; // Y axis
const maxRoomWidth = 12; // X axis

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
    for (i = 0; i < attempts; i++) {
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

    //RECURSIVE BACKTRACKER
    //pick a location, can be on the edge of the grid or from one of the rooms
    //pick a direction, left, right, up or down
    //check if a tile 1 step in that direction exists                                                               ...
    //from this tile, check if left, right, up and down (discardting the direction you just came from), are walls   .X.
    //PS: if you want a more square-ish result you want to check the entire square surrounding this tile            ...
    //if they are, you can place a tile here.

function generatePassageWaysPrim() {
    var randomRow = getRandomIntInclusive(1 , rows - 2);
    var randomColumn = getRandomIntInclusive(1, columns - 2);

    var walls = []; //add wall coordinates to this: [Y coordinate on grid, X coordinate on grid, offset from origin]

    grid[randomRow][randomColumn] = '.';

    if (randomRow - 1 > 0)
        walls.push([randomRow - 1, randomColumn, 'UP']); // upper wall

    if (randomRow + 1 < rows - 1)
        walls.push([randomRow + 1, randomColumn, 'DOWN']); // lower wall

    if (randomColumn - 1 > 0)
        walls.push([randomRow, randomColumn - 1, 'LEFT']); // left wall

    if (randomColumn + 1 < columns - 1)
        walls.push([randomRow, randomColumn + 1, 'RIGHT']); // right wall

    while (walls.length > 0) {
        var randomIndex = Math.random() * (walls.length - 1);
        var randomWall = walls[randomIndex];

        //with direction data, check the tile on the opposite site of the walls origin
        //also check the 5 surrounding tiles like this if the direction was right:
        // #    X   X
        // . -> W   X
        // #    X   X
        //the W is the wall that's being checked
        //the X'es are the aditional tiles that need to be checked
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
    //placeRooms();
    generatePassageWaysPrim()
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
