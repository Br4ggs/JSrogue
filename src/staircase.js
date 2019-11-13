var StairCase = function (yPos, xPos, direction) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.direction = direction;
};

StairCase.prototype.inspect = function () {
    var dir = (this.direction ? "upwards" : "downwards");
    writeToConsole(`A staircase leading ${dir}.`);
};

StairCase.prototype.interact = function () {
    if(this.direction) {
        writeToConsole("The staircase is locked.");
    }
    else {
        if(!layer3Generator.player.hasKey) {
            writeToConsole("You do not have the key for the staircase.");
            return;
        }

        writeToConsole("You enter the staircase and traverse to the lower level.");
        layer3Generator.player.hasKey = false;
        nextLevel();
    }
};