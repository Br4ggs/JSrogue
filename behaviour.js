var rows = 10;
var columns = 20;
var grid;

function generateLayout() {
    var grid = [];

    for (y = 0; y < rows; y++) {
        grid[y] = [];
        for (x = 0; x < columns; x++) {
            if (y === 0 || y === rows - 1 || x === 0 || x === columns - 1) {
                grid[y][x] = '#';
            }
            else {
                grid[y][x] = '.';
            }

        }
    }

    return grid;
}

function drawGrid() {
    var textRows = [];
    for (i = 0; i < rows; i++) {
        textRows[i] = grid[i].join('');
    }
    document.getElementById("PlayField").innerHTML = textRows.join('<br>');
}

window.onload = function () {
    grid = generateLayout();
    drawGrid();
    document.onkeydown = function (e) {
        switch (String.fromCharCode(e.keyCode)) {
            case 'W':
                console.log('MOVE UP');
                break;
            case 'A':
                console.log('MOVE LEFT');
                break;
            case 'S':
                console.log('MOVE DOWN');
                break;
            case 'D':
                console.log('MOVE RIGHT');
                break;
        }
    };
};
