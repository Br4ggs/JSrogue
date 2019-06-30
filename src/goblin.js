var Goblin = function(yPos,xPos) {
    this.yPos = yPos;
    this.xPos = xPos;

    this.health = 3;

    this.roamTargetY = yPos;
    this.roamTargetX = xPos;

    this.blockCounter = 0;
    this.maxBlockCounter = 3;
}

Goblin.prototype.getPathTo = function(yPos, xPos) {
    const frontier = [];
    const cameFrom = {};
    const cost = {};

    frontier.push({yPos: yPos, xPos: xPos, prio: 0});
    cameFrom[[yPos, xPos]] = null;
    cost[[yPos, xPos]] = 0;

    while(frontier.length > 0) {

        frontier.sort((a,b) => a.prio - b.prio);
        const tile = frontier.shift();

        if(tile.yPos === this.yPos && tile.xPos === this.xPos) {
            break;
        }

        for (let offSetY = -1; offSetY < 2; offSetY++) {
            for (let offSetX = -1; offSetX < 2; offSetX++) {

                if (offSetY === offSetX || offSetY === -offSetX) {
                    continue;
                }
              
                if (!isTraverseable(tile.yPos + offSetY, tile.xPos + offSetX)) {
                    continue;
                }

                let newCost = cost[[tile.yPos, tile.xPos]] + (layer3Generator.isOccupied(tile.yPos + offSetY, tile.xPos + offSetX) ? 20 : 1);

                if(cost[[tile.yPos + offSetY, tile.xPos + offSetX]] === undefined || newCost < cost[[tile.yPos + offSetY, tile.xPos + offSetX]]) {
                    cost[[tile.yPos + offSetY, tile.xPos + offSetX]] = newCost;
                    frontier.push({yPos: tile.yPos + offSetY, xPos: tile.xPos + offSetX, prio: newCost});
                    cameFrom[[tile.yPos + offSetY, tile.xPos + offSetX]] = {yPos: tile.yPos, xPos: tile.xPos};
                }
            }
        }
    }

    return cameFrom;
}

Goblin.prototype.setNewRoamTarget = function() {
    const tiles = this.getReachableTiles(this.yPos, this.xPos);
    const tile = tiles[Math.floor(Math.random()*tiles.length)];
    ({yPos : this.roamTargetY, xPos : this.roamTargetX} = tile);
    //take random y and x pos
    //make this the new target
}

Goblin.prototype.getReachableTiles = function(yPos, xPos) {
    const traversedTiles = [];
    const frontier = [];

    traversedTiles.push({yPos: yPos, xPos: xPos});
    frontier.push({yPos: yPos, xPos: xPos});

    while(frontier.length > 0) {
        const currentTile = frontier.shift();

        for (let offSetY = -1; offSetY < 2; offSetY++) {
            for (let offSetX = -1; offSetX < 2; offSetX++) {

                if (offSetY === offSetX || offSetY === -offSetX) {
                    continue;
                }
              
                if (!isTraverseable(currentTile.yPos + offSetY, currentTile.xPos + offSetX)) {
                    continue;
                }

                if(traversedTiles.filter(tile => tile.yPos === currentTile.yPos + offSetY && tile.xPos === currentTile.xPos + offSetX).length < 1) {
                    traversedTiles.push({yPos: currentTile.yPos + offSetY, xPos: currentTile.xPos + offSetX});
                    frontier.push({yPos: currentTile.yPos + offSetY, xPos: currentTile.xPos + offSetX});
                }
            }
        }
    }

    return traversedTiles;
}

Goblin.prototype.act = function() {
    const {yPos, xPos} = layer3Generator.player;
    let path = this.getPathTo(yPos, xPos);
    let nextStep = path[[this.yPos, this.xPos]];

    if(nextStep !== undefined) {
        if(distance(this.yPos, this.xPos, layer3Generator.player.yPos, layer3Generator.player.xPos) === 1){
            writeToConsole("the goblin attacks");
        }
        else if (!layer3Generator.isOccupied(nextStep.yPos, nextStep.xPos)){
            ({yPos : this.yPos, xPos : this.xPos} = nextStep);
        }
    }
    else {
        console.log("cannot find path to player");
        // OR getpathto target returns undefined
        //TODO: this path should only be calculated once
        path = this.getPathTo(this.roamTargetY, this.roamTargetX);
        nextStep = path[[this.yPos, this.xPos]];
        //TODO: test this
        if(distance(this.yPos, this.xPos, this.roamTargetY, this.roamTargetX) <= 1 || nextStep === undefined || this.blockCounter >= this.maxBlockCounter) {
            this.blockCounter = 0;
            this.setNewRoamTarget();
        }
        else if(layer3Generator.isOccupied(nextStep.yPos, nextStep.xPos)) {
            this.blockCounter++;
            console.log("added to counter");
        }
        else {
            ({yPos : this.yPos, xPos : this.xPos} = nextStep);
        }
    }
}

function moveGoblins() {
    console.log("doot");
    layer3Generator.goblins.forEach(goblin => goblin.act());
    drawDisplay();
}