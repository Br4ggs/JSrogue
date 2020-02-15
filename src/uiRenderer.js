/**
 * The uiRenderer is responsible for drawing the game on the screen/canvas
 */
const maxConsoleLines = 5;
const visitedTiles = new Map();
const display = [];

//TODO: game state should not store ascii representation of tiles
//TODO: retrieving tiles should be abstracted through functions on a state manager

function uiInit() {
    //refresh display area
    visitedTiles.clear();
    for (y = 0; y < layer1Generator.rows; y++) {
        display[y] = [];
        for (x = 0; x < layer1Generator.columns; x++) {
            display[y][x] = ' ';
        }
    }
}

/**
 * Updates the main viewport to show the latest data from the multiple dungeon layers
 */
function drawDisplay() {
    const visibleTiles = generateVisibility();

    //might optimize later
    visitedTiles.forEach((value, key) => {
        const pos = key.split("-");
        display[pos[0]][pos[1]] = value;
    });

    //then draw currently visible tiles, also update visited tiles
    visibleTiles.forEach(tile => {
        const player = layer3Generator.player;
        //map distance from max octant length to 1 to 0.5
        const opacity = 1 - (distance(player.yPos, player.xPos, tile.yPos, tile.xPos) * (1.0 - 0.25) / (28.0));
        let hsl;
        let hue;
        let saturation;
        let lightness;
        let char;
        if (layer3Generator.isOccupied(tile.yPos, tile.xPos)) {
            char = 'G';
            hue = 110;
            saturation = "50%";
            lightness = "50%";
        }
        else if (layer2Generator.isOccupied(tile.yPos, tile.xPos)) {
            const obj = layer2Generator.getObject(tile.yPos, tile.xPos);
            switch (obj.constructor) {
                case Key:
                    char = 'k';
                    hue = 11;
                    saturation = "100%";
                    lightness = "60%";
                    break;
                case Potion:
                    char = 'p';
                    hue = 299;
                    saturation = "88%";
                    lightness = "57%";
                    break;
                case GoldSack:
                    char = 'g';
                    hue = 46;
                    saturation = "100%";
                    lightness = "50%";
                    break;
                case Door:
                    char = (obj.open ? '-' : '+');
                    hue = 34;
                    saturation = "43%";
                    lightness = "44%";
                    break;
                case StairCase:
                    char = (obj.direction ? 'U' : 'D');
                    hue = 0;
                    saturation = "75%";
                    lightness = "50%";
                    break;
            }
        }
        else {
            char = layer1Generator.grid[tile.yPos][tile.xPos].symbol;
            if(char === '#') char = '&block;';
            hue = 0;
            saturation = "100%";
            lightness = "100%";
        }

        visitedTiles.set(`${tile.yPos}-${tile.xPos}`, `<font style="color:hsl(${hue},${saturation},${lightness},0.25)">${char}</font>`);
        display[tile.yPos][tile.xPos] = `<font style="color:hsl(${hue},${saturation},${lightness},${opacity})">${char}</font>`;
    });

    display[layer3Generator.player.yPos][layer3Generator.player.xPos] = `<font style="color:hsl(55, 75%, 50%, 1)">@</font>`;

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