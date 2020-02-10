var Door = function (yPos, xPos) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.open = false;
};

Door.prototype.inspect = function () {
    writeToConsole("A door. From the looks of it, it apears to be " + (this.open ? "open" : "closed"));
};

Door.prototype.interact = function () {
    if (layer3Generator.isOccupied(this.yPos, this.xPos)) {
        writeToConsole("There's something in the way!");
        return;
    }

    this.open = !this.open;

    writeToConsole("You " + (this.open ? "open" : "close") + " the door.");
};

Door.prototype.isOpaque = function () {
    return !this.open
};