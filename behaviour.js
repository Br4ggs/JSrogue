const attempts = 10;
const maxRoomHeight = 10; // Y axis
const maxRoomWidth = 10; // X axis

const rows = 40; // Y axis
const columns = 150; // X axis
var grid;

var playerPosY, playerPosX;

function placeRooms() {
    for (i = 0; i < attempts; i++) {
        var randomRow = Math.floor((Math.random() * (rows - 2) + 1));
        var randomColumn = Math.floor((Math.random() * (columns - 2) + 1));

        var roomHeight = Math.floor(Math.random() * maxRoomHeight);
        var roomWidth = Math.floor(Math.random() * maxRoomWidth);

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

function generateLayout() {
    var grid = [];

    for (y = 0; y < rows; y++) {
        grid[y] = [];
        for (x = 0; x < columns; x++) {
            /*if (y === 0 || y === rows - 1 || x === 0 || x === columns - 1)
                grid[y][x] = '#';
            else
                grid[y][x] = '.';*/
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
            if (playerPosY === y && playerPosX === x)
                display[y][x] = '@';
            else
                display[y][x] = grid[y][x];
        }
    }

    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');
}

window.onload = function () {
    grid = generateLayout();
    setPlayerPos();
    placeRooms();
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
