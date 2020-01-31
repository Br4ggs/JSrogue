/**
 * The uiRenderer is responsible for drawing the game on the screen/canvas
 */
const maxConsoleLines = 5;

//TODO: game state should not store ascii representation of tiles
//TODO: retrieving tiles should be abstracted through functions on a state manager

/**
 * Updates the main viewport to show the latest data from the multiple dungeon layers
 */
function drawDisplay() {
    //TODO:
    //-try shadowcast

    let visibleTiles = generateVisibility();
    //draw these tiles and apply distance modifier to grayscale for a
    //round visibility effect
    
    //draw explored part op dungeon as dark grey(?)

    var display = [];
    
    //refresh display area
    for (y = 0; y < layer1Generator.rows; y++) {
        display[y] = [];
        for (x = 0; x < layer1Generator.columns; x++) {
            //if tile is in seen tiles list, display it as dark grey
            display[y][x] = ' ';
        }
    }

    visibleTiles.forEach(tile => {
        display[tile.yPos][tile.xPos] = layer1Generator.grid[tile.yPos][tile.xPos].symbol;
        if (display[tile.yPos][tile.xPos] === '#') {
            display[tile.yPos][tile.xPos] = '&block;';
        }
    });

    display[layer3Generator.player.yPos][layer3Generator.player.xPos] = "<font color='#FFF700'>@</font>";
    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');


    return
    //old stuff
    for (y = 0; y < layer1Generator.rows; y++) {
        display[y] = [];
        for (x = 0; x < layer1Generator.columns; x++) {
            display[y][x] = layer1Generator.grid[y][x].symbol;
            if (display[y][x] === '#') {
                display[y][x] = '&block;';
            }
        }
    }

    layer2Generator.items.forEach(item => {
        switch (item.constructor) {
            case Key:
                display[item.yPos][item.xPos] = "<font color='#FF5733'>k</font>";
                break;
            case Potion:
                display[item.yPos][item.xPos] = "<font color='#F033F2'>p</font>";
                break;
            case GoldSack:
                display[item.yPos][item.xPos] = "<font color='#FFC300'>g</font>";
                break;
        }
    });

    layer2Generator.doors.forEach(door => {
        display[door.yPos][door.xPos] = "<font color='#9F7640'>" + (door.open ? '-' : '+') + "</font>";
    });

    display[layer2Generator.upStairCase.yPos][layer2Generator.upStairCase.xPos] = "<font color='#E23D23'>U</font>";
    display[layer2Generator.downStairCase.yPos][layer2Generator.downStairCase.xPos] = "<font color='#E23D23'>D</font>";

    display[layer3Generator.player.yPos][layer3Generator.player.xPos] = "<font color='#FFF700'>@</font>";

    layer3Generator.goblins.forEach(goblin =>
        display[goblin.yPos][goblin.xPos] = "<font color='#68F971'>G</font>");

    if (uiState === "SELECT") {
        display[yCursorPos][xCursorPos] = "<mark>!</mark>";
    }

    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');
}

function drawKeyDescriptor() {
    document.getElementById("KeyDescriptor").innerHTML = Array.from(keyDescriptions, ([key, value]) => key + " : " + value).join(", ");
}

function drawHealthIndicator() {
    document.getElementById("HealthIndicator").innerHTML = "Health: " + layer3Generator.player.health + "/" + layer3Generator.player.maxHealth;
}

function writeToConsole(message) {

    //also add span for color
    var logArray = message.concat('<br>', document.getElementById("Console").innerHTML).replace(/  +|\n/g, "").split('<br>');

    if(logArray.length > maxConsoleLines) {
        logArray.pop();
    }

    //recolor spanner elements

    document.getElementById("Console").innerHTML = logArray.join('<br>');
}

function generateVisibility() {
    let visibleTiles = [];
    //generate 8 octants
    //merge them into single list
    for (i = 0; i < 1; i++) {
        visibleTiles = visibleTiles.concat(generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 4, 0));
    }
    //filter and return
    return visibleTiles;
}

//TODO: generate slopes of opaque tile transitions
//will generate a visibility bitmap of octant, point of view being 0,0
function generateOctant(startXpos, startYpos, length, orientation) {
    let previousTileOpaque = false;
    let inShadow = false;
    let visibleTiles = [];
    let shadowSlopes = [];
    for (y = 0; y < length; y++) {
        let pos = transformOctant(y, 0, orientation);
        pos.yPos += startYpos;

        //do boundary check here as well when you have function that checks both
        //x and y for being out of bounds

        for (x = 0; x <= y; x++) {
            let pos = transformOctant(y, x, orientation);
            pos.yPos += startYpos;
            pos.xPos += startXpos;
            //if pos out of bounds, break
            //TODO: also abstract this with a bounds checking function
            if(pos.xPos < 0 || pos.xPos > layer1Generator.columns - 1) break;
            if(pos.yPos < 0 || pos.yPos > layer1Generator.rows - 1) break;

            let currentTileOpaque = layer1Generator.grid[pos.yPos][pos.xPos].symbol === '#';

            //shadow boundary calculation
            //if x = 0, set previoustileOpaque to false
            if (x === 0) {
                previousTileOpaque = false;
            }

            //at end of loop set previousTileOpaque to wether current tile is a wall or not
            //if transition from non-opaque to opaque is found(!previousTileOpaque && currentTileOpaque), calculateUppershadowSlope for current tile
            if (!previousTileOpaque && currentTileOpaque) {
                console.log("entering wall block on Y: " + y + " X: " + x);
            }
            //if transition from opaque to non-opaque is found(previousTileOpaque && !currentTileOpaque), calculateLowerShadowSlope for current tile - 1 on x coord
            if (previousTileOpaque && !currentTileOpaque) {
                console.log("exiting wall block on Y: " + y + " X: " + x)
            }
            
            //if opaque tile is found on x = 0, calculateUpperShadowSlope for current tile (?)
            //if opaque tile is found on last x for row, calculateLowerShadowSlope for current tile
            if(currentTileOpaque && x === y) {
                console.log("wall on last tile of row on Y: " + y + " X: " + x);
            }

            //then calculate whether to skip, draw or add a shadow slope based on shadowcast calculation
            //TODO: if transitioned to or from opaque tile, calculate a boundary slope.
            //either a shadowstart or shadowend
            visibleTiles.push(pos);

            previousTileOpaque = currentTileOpaque;
        }
    }

    return visibleTiles;
}

function transformOctant(y, x, orientation) {
    switch(orientation) {
        case 0: return {yPos: y, xPos: x};
        case 1: return {yPos: y, xPos: -x};
        case 2: return {yPos: x, xPos: -y};
        case 3: return {yPos: -x, xPos: -y};
        case 4: return {yPos: -y, xPos: -x};
        case 5: return {yPos: -y, xPos: x};
        case 6: return {yPos: -x, xPos: y};
        case 7: return {yPos: x, xPos: y};
    }
}

function calculateUpperShadowSlope(yPos, xPos) {
    const y = yPos + 0.5;
    const x = xPos - 0.5;
    return calculateSlope(0,0,y,x);
}

function calculateLowerShadowSlope(yPos, xPos) {
    const y = yPos - 0.5;
    const x = xPos + 0.5;
    return calculateSlope(0,0,y,x);
}