var Player = function (yPos, xPos) {
    this.id = generateId();
    this.yPos = yPos;
    this.xPos = xPos;

    this.maxHealth = 10;
    this.health = this.maxHealth;

    this.attackPwr = 2;
    
    this.gold = 0;
    this.hasKey = false;
};