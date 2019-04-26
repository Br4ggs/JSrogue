/**
 * The IOController controls the player input of keys/controller data to the manager.
 */
var keyMap = new Map();
var keyDescriptions = new Map();

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

function registerKey(key, func, descr) {
    keyMap.set(key, func);
    keyDescriptions.set(key, descr);
    drawKeyDescriptor();
}

function deregisterKey(key) {
    keyMap.delete(key);
    keyDescriptions.delete(key);
    drawKeyDescriptor();
}

function clearMap() {
    keyMap = new Map();
    keyDescriptions = new Map();
    drawKeyDescriptor();
}

function setSelectMode(callback) {
    uiState = "SELECT";
    yCursorPos = layer3Generator.player.yPos;
    xCursorPos = layer3Generator.player.xPos;

    clearMap();

    registerKey('W', () => moveCursor('UP'), "Move cursor up");
    registerKey('A', () => moveCursor('LEFT'), "Move cursor left");
    registerKey('S', () => moveCursor('DOWN'), "Move cursor down");
    registerKey('D', () => moveCursor('RIGHT'), "Move cursor right");

    registerKey('N', setMoveMode, "Cancel");
    registerKey('Y', () => {
        callback();
        setMoveMode();
    }, "Accept");

    drawDisplay();
}

function setMoveMode() {
    uiState = "MOVE";

    clearMap();

    registerKey('W', () => tryPlayerMove('UP'), "Move up");
    registerKey('A', () => tryPlayerMove('LEFT'), "Move left");
    registerKey('S', () => tryPlayerMove('DOWN'), "Move down");
    registerKey('D', () => tryPlayerMove('RIGHT'), "Move right");

    registerKey('R', () => setSelectMode(playerInspect), "Inspect");
    registerKey('E', () => setSelectMode(playerInteract), "Interact");
    registerKey('I', showInventory, "Show inventory");

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