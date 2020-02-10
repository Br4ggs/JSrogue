/**
 * The uiRenderer is responsible for drawing the game on the screen/canvas
 */
const maxConsoleLines = 5;
const visitedTiles = [];

//TODO: game state should not store ascii representation of tiles
//TODO: retrieving tiles should be abstracted through functions on a state manager

/**
 * Updates the main viewport to show the latest data from the multiple dungeon layers
 */
function drawDisplay() {

    const visibleTiles = generateVisibility();
    //draw these tiles and apply distance modifier to grayscale for a
    //round visibility effect
    
    //draw explored part op dungeon as dark grey(?)

    const display = [];
    
    //refresh display area
    for (y = 0; y < layer1Generator.rows; y++) {
        display[y] = [];
        for (x = 0; x < layer1Generator.columns; x++) {
            //if tile is in seen tiles list, display it as dark grey
            display[y][x] = ' ';
        }
    }

    //visitedtiles

    visibleTiles.forEach(tile => {
        if (layer3Generator.isOccupied(tile.yPos, tile.xPos)) {
            display[tile.yPos][tile.xPos] = "<font color='#68F971'>G</font>";
        }
        else if (layer2Generator.isOccupied(tile.yPos, tile.xPos)) {
            const obj = layer2Generator.getObject(tile.yPos, tile.xPos);
            switch (obj.constructor) {
                case Key:
                    display[tile.yPos][tile.xPos] = "<font color='#FF5733'>k</font>";
                    break;
                case Potion:
                    display[tile.yPos][tile.xPos] = "<font color='#F033F2'>p</font>";
                    break;
                case GoldSack:
                    display[tile.yPos][tile.xPos] = "<font color='#FFC300'>g</font>";
                    break;
                case Door:
                    display[tile.yPos][tile.xPos] = "<font color='#9F7640'>" + (obj.open ? '-' : '+') + "</font>";
                    break;
                case StairCase:
                    display[tile.yPos][tile.xPos] = "<font color='#E23D23'>" + (this.direction ? 'U' : 'D') + "</font>"
                    break;
            }
        }
        else {
            display[tile.yPos][tile.xPos] = layer1Generator.grid[tile.yPos][tile.xPos].symbol;
        }
    });

    display[layer3Generator.player.yPos][layer3Generator.player.xPos] = "<font color='#FFF700'>@</font>";

    if (uiState === "SELECT") {
        display[yCursorPos][xCursorPos] = "<mark>!</mark>";
    }

    document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');

    return
    //old stuff
    // for (y = 0; y < layer1Generator.rows; y++) {
    //     display[y] = [];
    //     for (x = 0; x < layer1Generator.columns; x++) {
    //         display[y][x] = layer1Generator.grid[y][x].symbol;
    //         if (display[y][x] === '#') {
    //             display[y][x] = '&block;';
    //         }
    //     }
    // }

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

    //document.getElementById("PlayField").innerHTML = display.map(arr => arr.join('')).join('<br>');

    visibleTiles.forEach(tile => {
        display[tile.yPos][tile.xPos] = "<font color='#eb4034'>" +  layer1Generator.grid[tile.yPos][tile.xPos].symbol + "</font>";
    });

    display[layer3Generator.player.yPos][layer3Generator.player.xPos] = "<font color='#FFF700'>@</font>";
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
    const octant1 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 25, 0);
    const octant2 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 25, 1);
    const octant3 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 25, 2);
    const octant4 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 25, 3);
    const octant5 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 25, 4);
    const octant6 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 25, 5);
    const octant8 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 25, 7);
    const octant7 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 25, 6);

    const visibleTiles = [...octant1, ...octant2, ...octant3, ...octant4, ...octant5, ...octant6, ...octant7, ...octant8];
    return visibleTiles;
}

//will generate a visibility bitmap of octant, point of view being 0,0
function generateOctant(startXpos, startYpos, length, orientation) {
    let inShadow = false;
    const visibleTiles = [];
    const upperShadowSlopes = [];
    const lowerShadowSlopes = [];
    const shadows = [];
    for (y = 0; y < length; y++) {
        if (containsValueBetween(upperShadowSlopes, -10, 0) > -1) {
            inShadow = true;
        }
        else {
            inShadow = false;
        }
        for (x = 0; x <= y; x++) {      
            let pos = transformOctant(y, x, orientation);
            let prevPos = transformOctant(y, x - 1, orientation);
            let nextPos = transformOctant(y, x + 1, orientation);
            pos.yPos += startYpos;
            pos.xPos += startXpos;
            prevPos.yPos += startYpos;
            prevPos.xPos += startXpos;
            nextPos.yPos += startYpos;
            nextPos.xPos += startXpos;
            if (pos.xPos < 0 || pos.xPos > layer1Generator.columns - 1) break;
            if (pos.yPos < 0 || pos.yPos > layer1Generator.rows - 1) break;

            let upperShadowSlope = false;
            let lowerShadowSlope = false;

            const previousTileOpaque = (x > 0) ? isOpaque(prevPos.yPos, prevPos.xPos) : false;
            const nextTileOpaque = (x < y) ? isOpaque(nextPos.yPos, nextPos.xPos) : false;
            const currentTileOpaque = isOpaque(pos.yPos, pos.xPos);

            let lowerTileSlope = calculateLowerShadowSlope(y, x);
            let upperTileSlope = calculateUpperShadowSlope(y, x);

            const upperShadowIndex = containsValueBetween(upperShadowSlopes, upperTileSlope, lowerTileSlope);
            if (upperShadowIndex > -1) upperShadowSlope = true;

            const lowerShadowIndex = containsValueBetween(lowerShadowSlopes, upperTileSlope, lowerTileSlope);
            if (lowerShadowIndex > -1) lowerShadowSlope = true;

            if (upperShadowSlope && !lowerShadowSlope) {
                if (currentTileOpaque) {
                    visibleTiles.push(pos);
                    upperShadowSlopes.splice(upperShadowIndex, 1);
                    if (!previousTileOpaque) {
                        upperShadowSlopes.push(upperTileSlope);
                    }
                }
                else {
                    lowerTileSlope = calculateSlope(0, 0, y, x);
                    if (containsValueBetween(upperShadowSlope, upperTileSlope, lowerTileSlope) < 0) {
                        visibleTiles.push(pos);
                    }
                }
                inShadow = true;
            }

            else if (!upperShadowSlope && lowerShadowSlope) {
                if (currentTileOpaque) {
                    visibleTiles.push(pos);
                    lowerShadowSlopes.splice(lowerShadowIndex, 1);
                    if (!nextTileOpaque) {
                        lowerShadowSlopes.push(lowerTileSlope);
                    }
                }
                else {
                    upperTileSlope = calculateSlope(0, 0, y, x);
                    if (containsValueBetween(lowerShadowSlope, upperTileSlope, lowerTileSlope) < 0) {
                        visibleTiles.push(pos);
                    }
                }
                inShadow = false;
            }

            else if (upperShadowSlope && lowerShadowSlope) {
                visibleTiles.push(pos);
                upperShadowSlopes.splice(upperShadowIndex, 1);
                lowerShadowSlopes.splice(lowerShadowIndex, 1);
                inShadow = true;
            }

            else if (!upperShadowSlope && !lowerShadowSlope) {
                if (inShadow) continue;
                visibleTiles.push(pos);
                
                if (currentTileOpaque) {
                    if (!previousTileOpaque) {
                        upperShadowSlopes.push(upperTileSlope);
                    }

                    if (!nextTileOpaque) {
                        lowerShadowSlopes.push(lowerTileSlope);
                    }
                }
            }
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

function containsValueBetween(array, min, max) {
    for (i = 0; i < array.length; i++) {
        const val = array[i];
        if (val > min && val <= max) return i;
    }
    return -1;
}