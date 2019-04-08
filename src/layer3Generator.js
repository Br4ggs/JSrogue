/**
 * This is just a stump, actual generation of NPC's will come later.
 */
var Layer3Generator = function () {
    this.playerPosY;
    this.playerPosX;
};

Layer3Generator.prototype.generateLayer = function () {
    this.setPlayerPos();
};

Layer3Generator.prototype.setPlayerPos = function () {

    var stairPos = layer2Generator.downStairCase;
    var availableTiles = [];

    for (offSetY = -1; offSetY < 2; offSetY++) {
        for (offSetX = -1; offSetX < 2; offSetX++) {
            if (offSetY === 0 && offSetX === 0)
                continue;

            if (layer1Generator.grid[stairPos.yPos + offSetY][stairPos.xPos + offSetX].symbol === '.') {
                availableTiles.push({ yPos: stairPos.yPos + offSetY, xPos: stairPos.xPos + offSetX });
            }
        }
    }

    var playerPos = shuffle(availableTiles)[0];

    this.playerPosY = playerPos.yPos;
    this.playerPosX = playerPos.xPos;
};

Layer3Generator.prototype.movePlayer = function (direction) {
    switch (direction) {
        case 'UP':
            if (isTraverseable(this.playerPosY - 1, this.playerPosX))
                this.playerPosY--;
            break;
        case 'DOWN':
            if (isTraverseable(this.playerPosY + 1, this.playerPosX))
                this.playerPosY++;
            break;
        case 'LEFT':
            if (isTraverseable(this.playerPosY, this.playerPosX - 1))
                this.playerPosX--;
            break;
        case 'RIGHT':
            if (isTraverseable(this.playerPosY, this.playerPosX + 1))
                this.playerPosX++;
            break;
    }

    drawDisplay();
};