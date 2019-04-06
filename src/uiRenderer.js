/**
 * The uiRenderer is responsible for drawing the game on the screen/canvas
 */

 /**
 * Display the current grid and the entities in it on the page.
 */
function drawDisplay() {
    var display = [];

    for (y = 0; y < layer1Generator.rows; y++) {
        display[y] = [];
        for (x = 0; x < layer1Generator.columns; x++) {
            display[y][x] = layer1Generator.grid[y][x].symbol;
        }
    }

    //TODO: call some sort of helper method that collects all objects of layer 2
    //chests.forEach(chest => {
    //    display[chest.yPos][chest.xPos] = 'C';
    //});

    //display[upStairCase.yPos][upStairCase.xPos] = 'U';
    //display[downStairCase.yPos][downStairCase.xPos] = 'D';

    //display[playerPosY][playerPosX] = '@';
    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');
}