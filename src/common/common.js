/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

// Storage keys.
const VENDOR_OPTIONS = 'v';
const GLOBAL_OPTIONS = 'g';
const PURPOSES_OPTIONS = 'p';
const SPECIAL_FEATURES_OPTIONS = 'sf';

const OBJECTION = 0;
const CONSENT = 1;
const INHERITED = 2;

const PURPOSES_COUNT = 10;
const SPECIAL_FEATURES_COUNT = 2;

// getMessage alias
const getMessage = browser.i18n.getMessage;

/**
 * Open resources/vendor-list.json and return its content.
 */
function openVendorList () {
  return openJSON('resources/vendor-list.json');
}

/**
 * Open resources/cmp-list.json and return its content.
 */
function openCMPList () {
  return openJSON('resources/cmp-list.json');
}

/**
 * Open JSON file at provided path and return its content.
 */
function openJSON (path) {
  const url = browser.runtime.getURL(path);
  return fetch(url).then(response => response.json(), onError);
}

/**
 * Promise rejection handler.
 */
function onError (error) {
  let err = error;
  if (error.hasOwnProperty('message')) {
    err = error.message;
  }

  console.error(`Error: ${err}`);
}