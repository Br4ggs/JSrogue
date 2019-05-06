var Door = function (yPos, xPos) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.open = false;
};

Door.prototype.inspect = function () {
    writeToConsole("A door. From the looks of it, it apears to be " + (this.open ? "open" : "closed"));
};

Door.prototype.interact = function () {
    this.open = !this.open;

    writeToConsole("You " + (this.open ? "open" : "close") + " the door.");
};