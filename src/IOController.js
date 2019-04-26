/**
 * The IOController controls the player input of keys/controller data to the manager.
 */
var keyMap = new Map();
var uiState;
var xCursorPos;
var yCursorPos;

function initialize() {
    document.onkeydown = function (keyEvent) {
        var key = String.fromCharCode(keyEvent.keyCode);
        if (keyMap.has(key)) {
            keyMap.get(key)();
        }
    };

    setMoveMode();
}

window.addEventListener('load', initialize);

function registerKey(key, func) {
    keyMap.set(key, func);
}

function deregisterKey(key) {
    keyMap.delete(key);
}

function clearMap() {
    keyMap = new Map();
}

function setSelectMode(callback) {
    uiState = "SELECT";
    yCursorPos = layer3Generator.player.yPos;
    xCursorPos = layer3Generator.player.xPos;

    clearMap();

    registerKey('W', () => moveCursor('UP'));
    registerKey('A', () => moveCursor('LEFT'));
    registerKey('S', () => moveCursor('DOWN'));
    registerKey('D', () => moveCursor('RIGHT'));

    registerKey('N', setMoveMode);
    registerKey('Y', () => {
        callback();
        setMoveMode();
    });

    drawDisplay();
}

function setMoveMode() {
    uiState = "MOVE";

    clearMap();

    registerKey('W', () => tryPlayerMove('UP'));
    registerKey('A', () => tryPlayerMove('LEFT'));
    registerKey('S', () => tryPlayerMove('DOWN'));
    registerKey('D', () => tryPlayerMove('RIGHT'));

    registerKey('R', () => setSelectMode(playerInspect));
    registerKey('E', () => setSelectMode(playerInteract));
    registerKey('I', showInventory);

    drawDisplay();
}

function moveCursor(direction) {
    switch (direction) {
        case 'UP':
            if (yCursorPos > 0) {
                yCursorPos--;
            }
            break;
        case 'DOWN':
            if (yCursorPos < layer1Generator.rows - 1) {
                yCursorPos++;
            }
            break;
        case 'LEFT':
            if (xCursorPos > 0) {
                xCursorPos--;
            }
            break;
        case 'RIGHT':
            if (xCursorPos < layer1Generator.columns - 1) {
                xCursorPos++;
            }
            break;
    }
    drawDisplay();
}

function tryPlayerMove(direction) {
    //TODO: moveEntity should be on controller
    var result = layer3Generator.moveEntity(direction);
    if(result) {
        drawDisplay();
    }
    else {
        writeToConsole("I can't go that direction!");
    }
}

function playerInspect() {
    var result = layer3Generator.inspect(yCursorPos, xCursorPos);
    if(result !== null) {
        writeToConsole(result);
    }
    else {
        writeToConsole("Nothing to see here...");
    }
}

function playerInteract() {
    if (distance(layer3Generator.player.yPos, layer3Generator.player.xPos, yCursorPos, xCursorPos) > 1.5) {
        writeToConsole("That object is too far away...");
        return;
    }

    var result = layer3Generator.interact(yCursorPos, xCursorPos);
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