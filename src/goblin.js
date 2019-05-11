var Goblin = function(yPos,xPos) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.health = 3;
}

Goblin.prototype.move1StepToPlayer = function() {
    const {yPos: playerY, xPos: playerX} = layer3Generator.player;

    const frontier = [];
    const visited = {};

    frontier.push({yPos: playerY, xPos: playerX});
    visited[[playerY, playerX]] = true;

    while(frontier.length > 0) {
        const tile = frontier.shift();
        for (let offSetY = -1; offSetY < 2; offSetY++) {
            for (let offSetX = -1; offSetX < 2; offSetX++) {

                if (offSetY === offSetX || offSetY === -offSetX)
                    continue;

                if (isTraverseable(tile.yPos + offSetY, tile.xPos + offSetX) && visited[[tile.yPos + offSetY, tile.xPos + offSetX]] === undefined) {
                    frontier.push({yPos: tile.yPos + offSetY, xPos: tile.xPos + offSetX});
                    visited[[tile.yPos + offSetY, tile.xPos + offSetX]] = true;
                    layer1Generator.grid[tile.yPos + offSetY][tile.xPos + offSetX].symbol = '*';
                }
            }
        }
    }

    drawDisplay();
};