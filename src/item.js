var Item = function (yPos, xPos) {
    this.desc = "???";
    this.yPos = yPos;
    this.xPos = xPos;
};

Item.prototype.inspect = function () {
    writeToConsole(this.desc);
};

var Potion = function (yPos, xPos, hp) {
    Item.call(this, yPos, xPos);
    this.hp = hp;
    this.desc = "a health potion healing " + this.hp + " hitpoints.";
};

Potion.prototype = new Item();

var GoldSack = function (yPos, xPos, amount) {
    Item.call(this, yPos, xPos);
    this.amount = amount;
    this.desc = "a sack of gold containing " + this.amount + " gold.";
}

GoldSack.prototype = new Item();

var Key = function (yPos, xPos) {
    Item.call(this, yPos, xPos);
    this.desc = "the key to the next floor."
}

Key.prototype = new Item();

//what happens if they all have the same Item object as
//prototype?