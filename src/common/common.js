const VENDOR_OPTIONS = 'v';
const GLOBAL_OPTIONS = 'g';
const PURPOSES_OPTIONS = 'p';

const SPECIAL_FEATURES_OPTIONS = 'sf';

const OBJECTION = 0;
const CONSENT = 1;
const GLOBAL_VALUE = 2;

const PURPOSES_COUNT = 10;
const SPECIAL_FEATURES_COUNT = 2;

const getMessage = browser.i18n.getMessage;

function openVendorList () {
  return openJSON('resources/vendor-list.json');
}

function openCMPList () {
  return openJSON('resources/cmp-list.json');
}

function openJSON (path) {
  const url = browser.runtime.getURL(path);
  return fetch(url).then(response => response.json());
}