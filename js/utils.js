'use strict';

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


    // expandShown(i - 1, j - 1);
    // expandShown(i - 1, j);
    // expandShown(i - 1, j + 1);
    // expandShown(i, j - 1);
    // expandShown(i, j + 1);
    // expandShown(i + 1, j - 1);
    // expandShown(i + 1, j);
    // expandShown(i + 1, j + 1);