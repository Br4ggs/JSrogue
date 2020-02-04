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
    const octant1 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 0);
    const octant2 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 1);
    const octant3 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 2);
    const octant4 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 3);
    const octant5 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 4);
    const octant6 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 5);
    const octant7 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 6);
    const octant8 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 7);

    const visibleTiles = [...octant1, ...octant2, ...octant3, ...octant4, ...octant5, ...octant6, ...octant7, ...octant8]
    //filter and return
    return octant1;
}

//weird artifacting around long walls
//also add add doors into algorythm

//will generate a visibility bitmap of octant, point of view being 0,0
function generateOctant(startXpos, startYpos, length, orientation) {
    let previousTileOpaque = false;
    let shadowLevel = 0;
    const visibleTiles = [];
    const upperShadowSlopes = [];
    const lowerShadowSlopes = [];
    for (y = 0; y < length; y++) {
        shadowLevel = 0;
        previousTileOpaque = false;
        //let pos = transformOctant(y, 0, orientation);
        //pos.yPos += startYpos;

        //do boundary check here as well when you have function that checks both
        //x and y for being out of bounds

        for (x = 0; x <= y; x++) {
            let pos = transformOctant(y, x, orientation);
            pos.yPos += startYpos;
            pos.xPos += startXpos;
            //if pos out of bounds, break
            //TODO: also abstract this with a bounds checking function
            if (pos.xPos < 0 || pos.xPos > layer1Generator.columns - 1) break;
            if (pos.yPos < 0 || pos.yPos > layer1Generator.rows - 1) break;

            const currentTileSlope = calculateSlope(0,0,y,x);
            const previousTileSlope = (x < 1) ? -10 : calculateSlope(0,0,y,x-1);

            if (containsValueBetween(upperShadowSlopes, previousTileSlope, currentTileSlope)) {
                shadowLevel++;
            }
            else if (containsValueBetween(lowerShadowSlopes, previousTileSlope, currentTileSlope)) {
                shadowLevel--;
            }

            if (shadowLevel > 0) continue;

            const currentTileOpaque = layer1Generator.grid[pos.yPos][pos.xPos].symbol === '#';

            //at end of loop set previousTileOpaque to wether current tile is a wall or not
            //if transition from non-opaque to opaque is found(!previousTileOpaque && currentTileOpaque), calculateUppershadowSlope for current tile
            if (!previousTileOpaque && currentTileOpaque) {
                //console.log("entering wall block on Y: " + y + " X: " + x);
                //calculate upper shadow slope
                const slope = calculateUpperShadowSlope(y, x);
                upperShadowSlopes.push(slope);
            }
            //if transition from opaque to non-opaque is found(previousTileOpaque && !currentTileOpaque), calculateLowerShadowSlope for current tile - 1 on x coord
            else if (previousTileOpaque && !currentTileOpaque) {
                //console.log("exiting wall block on Y: " + y + " X: " + x)
                //calculate lower shadow slope
                const slope = calculateLowerShadowSlope(y, x - 1);
                lowerShadowSlopes.push(slope);
            }
            //if opaque tile is found on last x for row, calculateLowerShadowSlope for current tile
            else if (currentTileOpaque && x === y) {
                //console.log("wall on last tile of row on Y: " + y + " X: " + x);
                //calculate lower shadow slope
                const slope = calculateLowerShadowSlope(y, x);
                lowerShadowSlopes.push(slope);
            }

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

//might use this later when optimising, not sure yet.
function sortedIndex(array, value) {
    var low = 0,
    high = array.length;

    while (low < high) {
        var mid = low + high >>> 1;
        if (array[mid] < value) low = mid + 1;
        else high = mid;
    }
    return low;
}

//test around with inclusiveness
function containsValueBetween(array, min, max) {
    for (i = 0; i < array.length; i++) {
        const val = array[i];
        if (val > min && val <= max) return true;
    }
    return false;
}