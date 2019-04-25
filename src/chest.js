/**
 * data container for a chest
 * @param {number} yPos 
 * @param {number} xPos 
 * @param {Array<Item>} items 
 */
var Chest = function (yPos, xPos, items) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.items = items;
};

Chest.prototype.inspect = function () {
    return "An ordinary chest, nothing special about it really, apart from perhaps it's contents.";
};

Chest.prototype.interact = function () {
    if (this.items.length < 1) {
        return "the chest appears to be empty";
    }
    var text = "The chest contained the following items: " + this.items.toString();
    layer3Generator.player.items = layer3Generator.player.items.concat(this.items);
    this.items = [];
    return text;
};