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
    //initiate new level generation
    var dir = (this.direction ? "upwards" : "downwards");
    writeToConsole(`This will take you a level ${dir}`);
};