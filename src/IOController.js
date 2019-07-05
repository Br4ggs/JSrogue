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
        setMoveMode();
        callback();
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
    registerKey('T', () => setSelectMode(() => playerAttack(yCursorPos, xCursorPos)), "Attack");
    registerKey('Y', showInventory, "Show inventory");

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

//TODO: rework chests into simple items laying on the ground
//you can pick them up manually but they will automatically be picked up as soon as you walk over them

//TODO: this could be turned into a tryMoveAction object
function tryPlayerMove(yDir, xDir) {
    var result = layer3Generator.moveEntity(yDir, xDir);
    if (result) {
        moveGoblins();
        drawDisplay();
    }
    else {
        //TODO: with an entity component system you dont have to make this distinction,
        // so everything could be in one domain
        if (layer3Generator.isOccupied(layer3Generator.player.yPos + yDir, layer3Generator.player.xPos + xDir)){
            playerAttack(layer3Generator.player.yPos + yDir, layer3Generator.player.xPos + xDir);
        }
        else if (layer2Generator.isOccupied(layer3Generator.player.yPos + yDir, layer3Generator.player.xPos + xDir)) {
            const obj = layer2Generator.getObject(layer3Generator.player.yPos + yDir, layer3Generator.player.xPos + xDir);

            if (obj instanceof Door || obj instanceof StairCase) {
                playerInteract(layer3Generator.player.yPos + yDir, layer3Generator.player.xPos + xDir);
            }
        }
        else {
            writeToConsole("I can't go that direction!");
            moveGoblins();
            drawDisplay();
        }
    }
}

function playerInspect(yPos, xPos) {
    var result = layer3Generator.inspect(yPos, xPos);
    if (!result) {
        writeToConsole("Nothing to see here...");
    }
    drawDisplay();
}

function playerInteract(yPos, xPos) {
    if (distance(layer3Generator.player.yPos, layer3Generator.player.xPos, yPos, xPos) > 1.5) {
        writeToConsole("That object is too far away...");
        return;
    }

    const result = layer3Generator.interact(yPos, xPos);
    if (!result) {
        writeToConsole("Nothing to interact with here...");
    }

    moveGoblins();
    drawDisplay();
}

function playerAttack(yPos, xPos) {
    if (distance(layer3Generator.player.yPos, layer3Generator.player.xPos, yPos, xPos) > 1.5) {
        writeToConsole("That is too far away...");
        return;
    }

    const result = layer3Generator.attack(layer3Generator.player, yPos, xPos);
    if (!result) {
        writeToConsole("You swing your sword at nothing...");
    }

    moveGoblins();
    drawDisplay();
}

function showInventory() {
    writeToConsole("You currently have " + layer3Generator.player.gold.toString() + " gold.");
    writeToConsole("You currently " + (layer3Generator.player.hasKey ? "have" : "do not have") + " the key to the next floor.");
}

function gameOver() {
    clearMap();
    registerKey('R', () => null, "Restart");
    writeToConsole("You died, press R to restart");
    drawDisplay();
}