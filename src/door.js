var Door = function (yPos, xPos) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.open = false;
};

Door.prototype.inspect = function () {
    return "A door. from the looks of it, it apears to be " + (this.open) ? "open" : "closed";
};

Door.prototype.interact = function () {
    this.open = !this.open;

    return "You " + (this.open) ? "opened" : "closed" + "the door.";
};