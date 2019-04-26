/**
 * The uiRenderer is responsible for drawing the game on the screen/canvas
 */
const maxConsoleLines = 4;

/**
 * Updates the main viewport to show the latest data from the multiple dungeon layers
 */
function drawDisplay() {
    var display = [];

    for (y = 0; y < layer1Generator.rows; y++) {
        display[y] = [];
        for (x = 0; x < layer1Generator.columns; x++) {
            display[y][x] = layer1Generator.grid[y][x].symbol;
        }
    }

    layer2Generator.chests.forEach(chest => {
        display[chest.yPos][chest.xPos] = 'C';
    });

    layer2Generator.doors.forEach(door => {
        display[door.yPos][door.xPos] = door.open ? '-' : '+';
    });

    display[layer2Generator.upStairCase.yPos][layer2Generator.upStairCase.xPos] = 'U';
    display[layer2Generator.downStairCase.yPos][layer2Generator.downStairCase.xPos] = 'D';

    display[layer3Generator.player.yPos][layer3Generator.player.xPos] = '@';

    if (uiState === "SELECT") {
        display[yCursorPos][xCursorPos] = "<mark>!</mark>";
    }

    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');
}

//TODO: add function for updating key hints

function writeToConsole(message) {

    //also add span for color
    var logArray = message.concat('<br>', document.getElementById("Console").innerHTML).replace(/  +|\n/g, "").split('<br>');

    if(logArray.length > maxConsoleLines) {
        logArray.pop();
    }

    //recolor spanner elements

    document.getElementById("Console").innerHTML = logArray.join('<br>');
}