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
    layer2Generator.chests.forEach(chest => {
        display[chest.yPos][chest.xPos] = 'C';
    });

    display[layer2Generator.upStairCase.yPos][layer2Generator.upStairCase.xPos] = 'U';
    display[layer2Generator.downStairCase.yPos][layer2Generator.downStairCase.xPos] = 'D';

    display[playerPosY][playerPosX] = '@';
    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');
}