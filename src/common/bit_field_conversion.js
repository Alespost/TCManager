/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

const RADIX = 2;

/**
 * Convert integer to bit field of required length.
 */
function intToBitField (number, requiredLength) {
  return number.toString(RADIX).padStart(requiredLength, '0');
}

/**
 * Convert string to bit field of required length.
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
        .toString(RADIX)
        .padStart(charBitLength, '0');
    }
  }
  return bits;
}

/**
 * Convert array of 0 and 1 to bit field of required length.
 */
function arrayToBitField (array, requiredLength) {
  let bits = '';

  for (let item of array) {
    bits += item ? '1' : '0';
  }

  return bits.padEnd(requiredLength, '0');
}