/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * @param {int} min The minimum bottom for the range (inclusive).
 * @param {int} max The maximum top for the range (inclusive).
 * @returns {int} the newly created integer.
 */
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Scrambles an array to randomize it.
 * @param {any} array The array to shuffle.
 * @returns the shuffled array.
 */
function shuffle(array) {
    var newArray = [...array];

    var currentIndex = newArray.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = newArray[currentIndex];
        newArray[currentIndex] = newArray[randomIndex];
        newArray[randomIndex] = temporaryValue;
    }

    return newArray;
}

/**
 * Gives the distance between 2 points.
 * @param {number} yPos1 Y position of first point.
 * @param {number} xPos1 X position of first point.
 * @param {number} yPos2 Y position of second point.
 * @param {number} xPos2 X position of second point.
 * @returns {number} Distance between the 2 point.
 */
function distance(yPos1, xPos1, yPos2, xPos2) {
    var a = xPos1 - xPos2;
    var b = yPos1 - yPos2;

    return Math.sqrt(a * a + b * b);
}

/**
 * Generates a unique ID.
 * @returns {string} the ID.
 */
function generateId() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

/**
 * Calculates the slope of 2 given points.
 * @param {number} yPos1 Y position of the first point.
 * @param {number} xPos1 X position of the first point.
 * @param {number} yPos2 Y position of the second point.
 * @param {number} xPos2 X position of the second point.
 */
function calculateSlope(yPos1, xPos1, yPos2, xPos2) {
    const x = xPos2 - xPos1;
    const y = yPos2 - yPos1;

    return x/y;
}