/**
 * The IOController controls the player input of keys/controller data to the manager.
 */
function initialize() {
    document.onkeydown = function (e) {
        switch (String.fromCharCode(e.keyCode)) {
            case 'W':
                tryPlayerMove('UP');
                break;
            case 'A':
                tryPlayerMove('LEFT');
                break;
            case 'S':
                tryPlayerMove('DOWN');
                break;
            case 'D':
                tryPlayerMove('RIGHT');
                break;
            case 'R':
                playerInspect();
                break;
            case 'E':
                playerInteract();
                break;
            case 'I':
                showInventory();
        }
    };
}

window.addEventListener('load', initialize);

function tryPlayerMove(direction) {
    //TODO: moveEntity should be on controller
    var result = layer3Generator.moveEntity(direction)
    if(result) {
        drawDisplay();
    }
    else {
        writeToConsole("I can't go that direction!");
    }
}

function playerInspect() {
    //throw up cursor mode for exact position
    //call inspect on layer 3
    var result = layer3Generator.inspect(layer3Generator.player.yPos, layer3Generator.player.xPos);
    if(result !== null) {
        writeToConsole(result);
    }
    else {
        writeToConsole("Nothing to see here...");
    }
}

function playerInteract() {
    var result = layer3Generator.interact(layer3Generator.player.yPos, layer3Generator.player.xPos);
    if(result !== null) {
        writeToConsole(result);
    }
    else {
        writeToConsole("Nothing to interact with here...");
    }
}

function showInventory() {
    if(layer3Generator.player.items.length < 1) {
        writeToConsole("Your inventory is currently empty");
    }
    else {
        writeToConsole("You are currently holding: " + layer3Generator.player.items.toString());
    }
}