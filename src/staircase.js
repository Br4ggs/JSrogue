/**
 * 
 * @param {number} yPos 
 * @param {number} xPos 
 * @param {boolean} direction true is upwards, false is downwards.
 */
var StairCase = function(yPos, xPos, direction) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.direction = direction
}

StairCase.prototype.inspect = function() {
    var dir = (this.direction ? "upwards" : "downwards")
    return `A staircase leading ${dir}.`
}

StairCase.prototype.interact = function() {
    //initiate new level generation
    var dir = (this.direction ? "upwards" : "downwards")
    return `This will take you a level ${dir}`;
}