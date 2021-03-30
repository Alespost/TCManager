/**
 *
 * @param number {number}
 * @param requiredLength {number}
 * @returns {string}
 */
function intToBitField (number, requiredLength) {
  return number.toString(2).padStart(requiredLength, '0');
}

/**
 *
 * @param str {string}
 * @param requiredLength {number}
 * @returns {string}
 */
function stringToBitField (str, requiredLength) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let bits = '';

  str = str.toLowerCase();

  let charBitLength = requiredLength / str.length;
  for (let i = 0; i < str.length; i++) {
    if (alphabet.indexOf(str[i]) !== -1) {
      bits += alphabet
        .indexOf(str[i])
        .toString(2)
        .padStart(charBitLength, '0');
    }
  }
  return bits;
}

/**
 *
 * @param array
 * @param requiredLength
 */
function booleanArrayToBitField (array, requiredLength) {
  let bits = '';

  for (let item of array) {
    bits += item ? '1' : '0';
  }

  return bits.padEnd(requiredLength, '0');
}