var Goblin = function(yPos,xPos) {
    this.id = generateId();
    this.yPos = yPos;
    this.xPos = xPos;

    this.maxHealth = 4;
    this.health = this.maxHealth;
    this.attackPwr = 1;

    this.chasingPlayer = false;
    this.roamTargetY = yPos;
    this.roamTargetX = xPos;

    this.setNewRoamTarget();
    this.pathToRoamTarget = this.getPathTo(this.roamTargetY, this.roamTargetX);

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
    let path;
    let nextStep;
    
    if(refreshPathing)
    {
        const {yPos, xPos} = layer3Generator.player;
        path = this.getPathTo(yPos, xPos);
        nextStep = path[[this.yPos, this.xPos]];
        if(nextStep === undefined)
        {
            this.chasingPlayer = false;
        }
        else
        {
            this.chasingPlayer = true;
        }

        if(!this.chasingPlayer)
        {
            this.pathToRoamTarget = this.getPathTo(this.roamTargetY, this.roamTargetX);
            nextStep = this.pathToRoamTarget[[this.yPos, this.xPos]];
            if(nextStep === undefined)
            {
                this.setNewRoamTarget();
                this.pathToRoamTarget = this.getPathTo(this.roamTargetY, this.roamTargetX);
            }
        }
    }

    if(this.chasingPlayer)
    {
        const {yPos, xPos} = layer3Generator.player;
        path = this.getPathTo(yPos, xPos); //this only needs to be checked when a player opens/closes a door
        nextStep = path[[this.yPos, this.xPos]];

        if(distance(this.yPos, this.xPos, layer3Generator.player.yPos, layer3Generator.player.xPos) === 1){
            layer3Generator.attack(this, layer3Generator.player.yPos, layer3Generator.player.xPos);
        }
        else if (!layer3Generator.isOccupied(nextStep.yPos, nextStep.xPos)){
            ({yPos : this.yPos, xPos : this.xPos} = nextStep);
        }
    }
    else
    {
        nextStep = this.pathToRoamTarget[[this.yPos, this.xPos]];

        if(distance(this.yPos, this.xPos, this.roamTargetY, this.roamTargetX) <= 1 || nextStep === undefined || this.blockCounter >= this.maxBlockCounter) {
            this.blockCounter = 0;
            this.setNewRoamTarget();
            this.pathToRoamTarget = this.getPathTo(this.roamTargetY, this.roamTargetX);
        }
        else if(layer3Generator.isOccupied(nextStep.yPos, nextStep.xPos)) {
            this.blockCounter++;
        }
        else {
            ({yPos : this.yPos, xPos : this.xPos} = nextStep);
        }
    }
}

//TODO: move to ai actor class or something?
function moveGoblins() {
    layer3Generator.goblins.forEach(goblin => goblin.act());
}