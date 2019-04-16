/**
 * 
 * @param {number} yPos 
 * @param {number} xPos 
 * @param {Array<Item>} items 
 */
var Chest = function(yPos, xPos, items) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.items = items;
}

Chest.prototype.description = function() {
    return "An ordinary chest, nothing special about it really, apart from perhaps it's contents.";
}