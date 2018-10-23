var rows = 10;
var columns = 20;
var playerPosY, playerPosX;
var grid;

function generateLayout() {
    var grid = [];

    for (y = 0; y < rows; y++) {
        grid[y] = [];
        for (x = 0; x < columns; x++) {
            if (y === 0 || y === rows - 1 || x === 0 || x === columns - 1)
                grid[y][x] = '#';
            else
                grid[y][x] = '.';
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
