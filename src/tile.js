/**
 * This file will contain object constructors for different objects in the game
 */

/**
 * A tile represents a space on the grid
 * This is only used in the first layer
 */
var Tile = function(symbol, regionId, isRoom) {
    this.symbol = symbol;
    this.regionId = regionId;
    this.isRoom = isRoom;
}

/**
 * Representation of a room which consists of it's ID and the corresponding tiles.
 * 
 * @param {int} ID The ID of this room.
 */
function RoomData(ID) {
  if ( !(this instanceof RoomData)){
    return new RoomData();
  }

  this.ID = ID
  this.tiles = []
}

/**
* Represents a tile belonging to a room in the RoomData tile array.
* 
* @param {int} yPos The Y position of the tile on the grid.
* @param {int} xPos The X position of the tile on the grid.
*/
function RoomDataTile(yPos, xPos) {
  if ( !(this instanceof RoomDataTile)){
    return new RoomDataTile();
  }

  this.yPos = yPos;
  this.xPos = xPos;
}