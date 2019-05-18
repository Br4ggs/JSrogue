var Goblin = function(yPos,xPos) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.health = 3;

    this.mode = "";
}

Goblin.prototype.getPathToPlayer = function() {
    const {yPos: playerY, xPos: playerX} = layer3Generator.player;

    const frontier = [];
    const cameFrom = {};
    const cost = {};


    frontier.push({yPos: playerY, xPos: playerX, prio: 0});
    cameFrom[[playerY, playerX]] = null;
    cost[[playerY, playerX]] = 0;

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

//if roaming, target is random tile from flood fill
//once distance is 0 or this cannot be done, you set new target

//if chasing, always get path to newest player position
//if this cannot be done, set mode to roam

//TODO: make infinite loop enumerator function to test out
Goblin.prototype.act = function() {
    const path = this.getPathToPlayer();
    const nextStep = path[[this.yPos, this.xPos]];
    if(nextStep !== undefined) {
        if(distance(this.yPos, this.xPos, layer3Generator.player.yPos, layer3Generator.player.xPos) === 1){
            writeToConsole("the goblin attacks");
        }
        else if (!layer3Generator.isOccupied(nextStep.yPos, nextStep.xPos)){
            ({yPos : this.yPos, xPos : this.xPos} = nextStep);
        }
        //if the goblin is only 1 tile removed, try to attack
        //if the goblin is more tiles removed, try to move towards player
    }
    else {
        console.log("couldn't find a path");
    }
    //if the goblin can reach the player:
        //if the goblin is only 1 tile removed, try to attack
        //if the goblin is more tiles removed, try to move towards player

    //if not, pick out a random tile the goblin can reach, and make this the new target
}

//TODO: getPathTo method

function moveGoblins() {
    console.log("doot");
    layer3Generator.goblins.forEach(goblin => goblin.act());
    drawDisplay();
}