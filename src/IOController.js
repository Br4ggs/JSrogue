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

    registerKey('W', () => moveCursor(-1, 0), "Move cursor up");
    registerKey('A', () => moveCursor(0, -1), "Move cursor left");
    registerKey('S', () => moveCursor(1, 0), "Move cursor down");
    registerKey('D', () => moveCursor(0, 1), "Move cursor right");

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

    registerKey('W', () => tryPlayerMove(-1, 0), "Move up");
    registerKey('A', () => tryPlayerMove(0, -1), "Move left");
    registerKey('S', () => tryPlayerMove(1, 0), "Move down");
    registerKey('D', () => tryPlayerMove(0, 1), "Move right");

    registerKey('R', () => setSelectMode(() => playerInspect(yCursorPos, xCursorPos)), "Inspect");
    registerKey('E', () => setSelectMode(() => playerInteract(yCursorPos, xCursorPos)), "Interact");
    registerKey('I', showInventory, "Show inventory");

    drawDisplay();
}

function moveCursor(yDir, xDir) {
    if (yCursorPos > 0 && yCursorPos < layer1Generator.rows - 1) {
        yCursorPos += yDir;
    }

    if (xCursorPos > 0 && xCursorPos < layer1Generator.columns - 1) {
        xCursorPos += xDir;
    }
    drawDisplay();
}

function tryPlayerMove(yDir, xDir) {
    var result = layer3Generator.moveEntity(yDir, xDir);
    if (result) {
        drawDisplay();
    }
    else {
        if (layer2Generator.isOccupied(layer3Generator.player.yPos + yDir, layer3Generator.player.xPos + xDir)) {
            var obj = layer2Generator.getObject(layer3Generator.player.yPos + yDir, layer3Generator.player.xPos + xDir);

            if (obj instanceof Door) {
                playerInteract(layer3Generator.player.yPos + yDir, layer3Generator.player.xPos + xDir);
            }
        }
        else {
            writeToConsole("I can't go that direction!");
        }
    }
}

function playerInspect(yPos, xPos) {
    var result = layer3Generator.inspect(yPos, xPos);
    if (result !== null) {
        writeToConsole(result);
    }
    else {
        writeToConsole("Nothing to see here...");
    }
}

function playerInteract(yPos, xPos) {
    if (distance(layer3Generator.player.yPos, layer3Generator.player.xPos, yPos, xPos) > 1.5) {
        writeToConsole("That object is too far away...");
        return;
    }

    var result = layer3Generator.interact(yPos, xPos);
    if (result !== null) {
        writeToConsole(result);
    }
    else {
        writeToConsole("Nothing to interact with here...");
    }
    drawDisplay();
}

function showInventory() {
    if (layer3Generator.player.items.length < 1) {
        writeToConsole("Your inventory is currently empty");
    }
    else {
        writeToConsole("You are currently holding: " + layer3Generator.player.items.toString());
    }
}