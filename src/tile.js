/**
 * This file will contain object constructors for different objects in the game
 */

 /**
  * Quick note to self, but this is how im planning to go about this
  * Each generator file will define prototypes which are relevant to its generator logic
  * Once generation has completely finished, these prototype variables can be safely deleted.
  * (something) Like this example:

function Employee() {
    this.firstname = "John";
    this.lastname = "Doe";
  }
  
  Employee.prototype.test = "Hoi";
  
  var employee = new Employee();
  
  console.log(employee.test);
  // expected output: "John"
  
  delete Employee.prototype.test;
  
  console.log(employee.test);
  // expected output: undefined
*/ 

/**
 * A tile represents a space on the grid
 */
function Tile(symbol, regionId, isRoom) {
    if ( !(this instanceof Tile) )
    return new Tile();

    this.symbol = symbol;
    this.regionId = regionId;
    this.isRoom = isRoom;
}