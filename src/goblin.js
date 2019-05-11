var Goblin = function(yPos,xPos) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.health = 3;
}

Goblin.prototype.move1StepToPlayer = function() {
    const {yPos: playerY, xPos: playerX} = layer3Generator.player;

    const frontier = [];
    const cameFrom = {};

    frontier.push({yPos: playerY, xPos: playerX});
    cameFrom[[playerY, playerX]] = null;

    frontierLoop:
    while(frontier.length > 0) {
        const tile = frontier.shift();
        for (let offSetY = -1; offSetY < 2; offSetY++) {
            for (let offSetX = -1; offSetX < 2; offSetX++) {

                if (offSetY === offSetX || offSetY === -offSetX)
                    continue;

                if (isTraverseable(tile.yPos + offSetY, tile.xPos + offSetX) && cameFrom[[tile.yPos + offSetY, tile.xPos + offSetX]] === undefined) {
                    frontier.push({yPos: tile.yPos + offSetY, xPos: tile.xPos + offSetX});
                    cameFrom[[tile.yPos + offSetY, tile.xPos + offSetX]] = {yPos: tile.yPos, xPos: tile.xPos};

                    if(tile.yPos + offSetY === this.yPos && tile.xPos + offSetX === this.xPos) {
                        break frontierLoop;
                    }
                }
            }
        }
    }

    let currentTile = cameFrom[[this.yPos, this.xPos]];
    while (currentTile !== null) {
        layer1Generator.grid[currentTile.yPos][currentTile.xPos].symbol = '*';
        currentTile = cameFrom[[currentTile.yPos, currentTile.xPos]];
    }

    drawDisplay();
};