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
    // for (y = 0; y < layer1Generator.rows; y++) {
    //     display[y] = [];
    //     for (x = 0; x < layer1Generator.columns; x++) {
    //         //if tile is in seen tiles list, display it as dark grey
    //         display[y][x] = ' ';
    //     }
    // }

    //return
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
    const octant1 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 0);
    const octant2 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 1);
    const octant3 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 2);
    const octant4 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 3);
    const octant5 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 4);
    const octant6 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 5);
    const octant8 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 7);
    const octant7 = generateOctant(layer3Generator.player.xPos, layer3Generator.player.yPos, 15, 6);

    const visibleTiles = [...octant1, ...octant2, ...octant3, ...octant4, ...octant5, ...octant6, ...octant7, ...octant8];
    //filter and return
    return visibleTiles;
}

//weird artifacting around long walls
//also add add doors into algorythm

//will generate a visibility bitmap of octant, point of view being 0,0
function generateOctant(startXpos, startYpos, length, orientation) {
    //console.log("-----------------------------")
    let inShadow = false;
    const visibleTiles = [];
    const upperShadowSlopes = [];
    const lowerShadowSlopes = [];
    const shadows = [];
    for (y = 0; y < length; y++) {
        //inShadow = false;
        // previousTileOpaque = false;

        //if theres an upper slope lower than 0, set inshadow to true
        //else, false
        if (containsValueBetween(upperShadowSlopes, -10, 0) > -1) {
            inShadow = true;
        }
        else {
            inShadow = false;
            //console.log("not in shadow");
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
            //seems to work for now
            const previousTileOpaque = (x > 0) ? isOpaque(prevPos.yPos, prevPos.xPos) : false;
            const nextTileOpaque = (x < y) ? isOpaque(nextPos.yPos, nextPos.xPos) : false;
            const currentTileOpaque = isOpaque(pos.yPos, pos.xPos);

            const lowerTileSlope = calculateLowerShadowSlope(y, x);
            const upperTileSlope = calculateUpperShadowSlope(y, x);

            const upperShadowIndex = containsValueBetween(upperShadowSlopes, upperTileSlope, lowerTileSlope);
            if (upperShadowIndex > -1) upperShadowSlope = true;

            const lowerShadowIndex = containsValueBetween(lowerShadowSlopes, upperTileSlope, lowerTileSlope);
            if (lowerShadowIndex > -1) lowerShadowSlope = true;

            if (upperShadowSlope && !lowerShadowSlope) {
                //console.log("triggered upslope");
                if (currentTileOpaque) {
                    visibleTiles.push(pos);
                    upperShadowSlopes.splice(upperShadowIndex, 1);
                    if (!previousTileOpaque) {
                        upperShadowSlopes.push(upperTileSlope);
                    }
                }
                else {
                    //do calculations
                }
                inShadow = true;
                //visibletiles push this tile
                //if current tile is opaque
                //if previous tile was opaque, do not add a new upper shadow
                //else, do add new upper shadow
                //remove upper shadow that triggered this

                //if tile is not opaque
                //check if shadow covers upper half of this tile
                //if so, do not draw this tile
                //else, add to visibletiles
                
                //set inshadow to true
            }

            else if (!upperShadowSlope && lowerShadowSlope) {
                //console.log("triggered lowslope");
                if (currentTileOpaque) {
                    visibleTiles.push(pos);
                    lowerShadowSlopes.splice(lowerShadowIndex, 1);
                    if (!nextTileOpaque) {
                        lowerShadowSlopes.push(lowerTileSlope);
                    }
                }
                else {
                    //do calculations
                }
                inShadow = false;
                //visibletiles push this tile
                //if current tile is opaque
                //if next tile is opaque, do not add a new lower shadow
                //else, do add new lower shadow
                //remove lower shadow that triggered this.
                
                //if tile is not opaque
                //check if shadow covers lower half of this tile
                //if so, do not draw this tile
                //else, add to visibletiles
                
                //set inshadow to false
            }

            //maybe this will become unnecessary afterwards? dunno yet
            else if (upperShadowSlope && lowerShadowSlope) {
                //console.log("triggered 2 slopes");
                visibleTiles.push(pos);
                //visibletiles add this tile
                //remove both slopes
                //set inshadow to true
                upperShadowSlopes.splice(upperShadowIndex, 1);
                lowerShadowSlopes.splice(lowerShadowIndex, 1);
                inShadow = true;
            }

            else if (!upperShadowSlope && !lowerShadowSlope) {
                if (inShadow) continue;
                //visibleTiles.push(pos);
                
                if (currentTileOpaque) {
                    visibleTiles.push(pos);
                    //console.log(`no slopes found on Y${y} X${x}`);
                    if (!previousTileOpaque) {
                        upperShadowSlopes.push(upperTileSlope);
                    }

                    if (!nextTileOpaque) {
                        lowerShadowSlopes.push(lowerTileSlope);
                    }
                }
                //if inshadow is false, add this tile to visibletiles
                //else just skip

                //if current tile is opaque && inshadow is false
                //visibletiles add this tile
                //if previous tile was opaque, do not add a new upper shadow
                //else do
                //if next tile is opaque, do not add new lower shadow
                //else do
                //add new lower shadow
            }

            // //return;

            // //previoustileopaque should probably be set
            // //if coming out of a shadow, set previoustileopaque to false?
            // if (inShadow) {
            //     previousTileOpaque = false;
            //     continue;
            // }

            

            // //at end of loop set previousTileOpaque to wether current tile is a wall or not
            // //if transition from non-opaque to opaque is found(!previousTileOpaque && currentTileOpaque), calculateUppershadowSlope for current tile
            // if (!previousTileOpaque && currentTileOpaque) {
            //     //OR

            //     //check if theres a slope in upper shadow slopes that matches slope of left top side of this tile
            //     //if there is, remove it, and replace it with upper shadow slope of this tile
            //     //this makes sure shapes are treated the same as on the x axis
                
            //     //console.log("entering wall block on Y: " + y + " X: " + x);
            //     //calculate upper shadow slope
            //     const slope = calculateUpperShadowSlope(y, x);
            //     //onst offset = -0.045;
            //     // const lowerSlopeIndex = containsValueBetween(lowerShadowSlopes, previousTileSlope, currentTileSlope);
            //     // if(lowerSlopeIndex > -1) {
            //     //     console.log("removing lower slope @ Y: " + y + " X: " + x);
            //     //     lowerShadowSlopes.splice(lowerSlopeIndex, 1);
            //     //     //TODO AGAINST X-RAY SLOPES
            //     //     //before you push, check if a lower shadow slope exist in range of this slope.
            //     //     //if there is, remove slope and dont add this one to list
            //     // }
            //     // else {
            //     // }
            //     upperShadowSlopes.push(slope);
            // }
            // //if transition from opaque to non-opaque is found(previousTileOpaque && !currentTileOpaque), calculateLowerShadowSlope for current tile - 1 on x coord
            // else if (previousTileOpaque && !currentTileOpaque) {
            //     const slope = calculateLowerShadowSlope(y, x - 1);
            //     lowerShadowSlopes.push(slope);
            // }

            // visibleTiles.push(pos);

            // previousTileOpaque = currentTileOpaque;
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
        if (val > min && val <= max) return i;
    }
    return -1;
}