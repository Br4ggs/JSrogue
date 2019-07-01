var Player = function (yPos, xPos) {
    this.id = generateId();
    this.yPos = yPos;
    this.xPos = xPos;
    this.health = 10;
    this.attackPwr = 2;
    this.gold = 0;
    this.hasKey = false;
};