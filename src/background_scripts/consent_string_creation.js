browser.runtime.onMessage.addListener(consentRequestMessageHandler);

/**
 *
 * @param request
 * @param sender
 * @param sendResponse
 */
function consentRequestMessageHandler (request, sender, sendResponse) {
  const url = new URL(request.url);

  return new Promise(resolve => {
    getOptions(url.hostname)
      .then(createTCModel.bind(null, request))
      .then(createBitField)
      .then(encode)
      .then(storeConsent.bind(null, url, request.localStorageItems))
      .then((updatedItems) => resolve(updatedItems));
  });
}

/**
 *
 * @param {string} domain
 * @returns {PromiseLike<{} | *[]> | Promise<{} | *[]>}
 */
function getOptions (domain) {
  return browser.storage.sync.get([GLOBAL_OPTIONS, VENDOR_OPTIONS, domain])
    .then(onSuccess, onError);

  /**
   * @param result
   * @returns {{}}
   */
  function onSuccess (result) {
    const domainOptions = result[domain] ?? createDomainOptions(domain)[domain];
    const globalOptions = result[GLOBAL_OPTIONS];

    const purposes = [];
    for (const [index, value] of domainOptions[PURPOSES_OPTIONS].entries()) {
      if (value !== GLOBAL_VALUE) {
        purposes.push(value);
      } else {
        purposes.push(globalOptions[PURPOSES_OPTIONS][index]);
      }
    }

    const specialFeatures = [];
    for (const [index, value] of domainOptions[SPECIAL_FEATURES_OPTIONS].entries()) {
      if (value !== GLOBAL_VALUE) {
        specialFeatures.push(value);
      } else {
        specialFeatures.push(globalOptions[SPECIAL_FEATURES_OPTIONS][index]);
      }
    }

    const requiredOptions = {};
    requiredOptions[PURPOSES_OPTIONS] = purposes;
    requiredOptions[SPECIAL_FEATURES_OPTIONS] = specialFeatures;

    return [requiredOptions, result[VENDOR_OPTIONS]];
  }
}

/**
 *
 * @param data
 * @param options
 * @returns {object}
 */
function createTCModel (data, options) {
  const vendors = options[1];
  const globalVendorOpt = vendors[GLOBAL_OPTIONS];
  const vendorListVersion = vendors[VENDOR_OPTIONS];
  delete vendors[GLOBAL_OPTIONS];
  delete vendors[VENDOR_OPTIONS];

  options = options[0];

  const maxId = Math.max(...Object.keys(vendors));
  const bitField = [];

  for (let i = 1; i <= maxId; i++) {
    if (vendors.hasOwnProperty(i) && vendors[i] === GLOBAL_VALUE) {
      bitField.push(globalVendorOpt);
    } else if (vendors.hasOwnProperty(i)) {
      bitField.push(vendors[i]);
    } else {
      bitField.push(OBJECTION);
    }
  }

  const vendorConsent = {
    maxVendorId: maxId,
    isRangeEncoding: 0, // BitField
    bitField: bitField,
  };

  const vendorLI = {
    maxVendorId: maxId,
    isRangeEncoding: 0, // BitField
    bitField: bitField,
  };

  const timestamp = Math.round((new Date()).getTime() / 100);

  return {
    version: 2,
    created: timestamp,
    lastUpdated: timestamp,
    cmpId: data.cmpId,
    cmpVersion: data.cmpVersion,
    consentScreen: 1,
    consentLanguage: consentLanguage(),
    vendorListVersion: vendorListVersion,
    tcfPolicyVersion: 2,
    isServiceSpecific: 1,
    nonStandardStacks: 0,
    specialFeatureOptIns: options[SPECIAL_FEATURES_OPTIONS],
    purposesConsent: options[PURPOSES_OPTIONS],
    purposesLITransparency: options[PURPOSES_OPTIONS],
    purposeOneTreatment: 0,
    publisherCC: data.publisherCC,
    vendorConsent: vendorConsent,
    vendorLI: vendorLI,
    numPubRestrictions: 0,
  };

  function consentLanguage () {
    return browser.i18n
      .getUILanguage()
      .substr(0, 2)
      .toUpperCase();
  }
}

/**
 * https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20Consent%20string%20and%20vendor%20list%20formats%20v2.md#the-core-string
 * @param TCModel
 * @returns {string}
 */
function createBitField (TCModel) {
  const BIT_LEN_1 = 1;
  const BIT_LEN_6 = 6;
  const BIT_LEN_12 = 12;
  const BIT_LEN_16 = 16;
  const BIT_LEN_24 = 24;
  const BIT_LEN_36 = 36;

  let bitField = '';

  bitField += intToBitField(TCModel.version, BIT_LEN_6);
  bitField += intToBitField(TCModel.created, BIT_LEN_36);
  bitField += intToBitField(TCModel.lastUpdated, BIT_LEN_36);
  bitField += intToBitField(TCModel.cmpId, BIT_LEN_12);
  bitField += intToBitField(TCModel.cmpVersion, BIT_LEN_12);
  bitField += intToBitField(TCModel.consentScreen, BIT_LEN_6);
  bitField += stringToBitField(TCModel.consentLanguage, BIT_LEN_12);
  bitField += intToBitField(TCModel.vendorListVersion, BIT_LEN_12);
  bitField += intToBitField(TCModel.tcfPolicyVersion, BIT_LEN_6);
  bitField += intToBitField(TCModel.isServiceSpecific, BIT_LEN_1);
  bitField += intToBitField(TCModel.nonStandardStacks, BIT_LEN_1);
  bitField += arrayToBitField(TCModel.specialFeatureOptIns, BIT_LEN_12);
  bitField += arrayToBitField(TCModel.purposesConsent, BIT_LEN_24);
  bitField += arrayToBitField(TCModel.purposesLITransparency, BIT_LEN_24);
  bitField += intToBitField(TCModel.purposeOneTreatment, BIT_LEN_1);
  bitField += stringToBitField(TCModel.publisherCC, BIT_LEN_12);

  bitField += intToBitField(TCModel.vendorConsent.maxVendorId, BIT_LEN_16);
  bitField += intToBitField(TCModel.vendorConsent.isRangeEncoding, BIT_LEN_1);
  bitField += arrayToBitField(TCModel.vendorConsent.bitField, TCModel.vendorConsent.maxVendorId);

  bitField += intToBitField(TCModel.vendorLI.maxVendorId, BIT_LEN_16);
  bitField += intToBitField(TCModel.vendorLI.isRangeEncoding, BIT_LEN_1);
  bitField += arrayToBitField(TCModel.vendorLI.bitField, TCModel.vendorLI.maxVendorId);

  bitField += intToBitField(TCModel.numPubRestrictions, BIT_LEN_12);

  return bitField;
}

/**
 * https://github.com/InteractiveAdvertisingBureau/iabtcf-es/blob/master/modules/core/src/encoder/Base64Url.ts
 * @param bitString
 * @returns {string}
 */
function encode (bitString) {
  const DICT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const PADDING = 24;
  const BASIS = 6;

  const padding = bitString.length % PADDING;
  bitString += padding ? '0'.repeat(24 - padding) : '';

  let TCString = '';

  for (let i = 0; i < bitString.length; i += BASIS) {
    const index = parseInt(bitString.substr(i, BASIS), 2);
    TCString += DICT[index];
  }

  return TCString;
}

/**
 *
 * @param url
 * @param localStorageItems
 * @param TCString
 */
function storeConsent (url, localStorageItems, TCString) {
  storeCookies(TCString, url);

  return updateLocalStorageTCStrings(localStorageItems, TCString);
}

/**
 *
 * @param TCString
 * @param url
 */
function storeCookies (TCString, url) {
  const standardCookies = ['euconsent-v2', 'eupubconsent-v2', 'cconsent-v2'];

  const expiration = new Date();
  expiration.setFullYear(expiration.getFullYear() + 1);

  checkNonStandardCookieExists().then(result => {
    let cookie;
    if (result == null) {
      cookie = storeStandardCookies();
    } else {
      cookie = storeNonStandardCookie(result);
    }

    storeCookiesClosingBanner(cookie);

  });

  function checkNonStandardCookieExists () {
    return browser.cookies.getAll({ url: url.toString() }).then(
      cookies => {
        for (let cookie of cookies) {
          if (!standardCookies.includes(cookie.name)) {
            const matches = cookie.value.match(/(%27)?[A-Za-z0-9_-]{39,}(%27)?/g);

            // No TC string candidate in cookie
            if (!matches) {
              continue;
            }

            for (const match of matches) {
              try {
                const cleared = match.replace('%27', '');

                TCStringParse(cleared);
                return { cookie: cookie, TCString: cleared };
              } catch (e) {}
            } // for (match of matches)
          } // if (!standardCookies.includes(cookie.name))
        } // for (cookie of cookies)
        return null;
      }, onError);
  }

  function storeStandardCookies () {
    const hostname = url.hostname;
    let domains = [
      hostname.replace(/www/, ''),
      '.' + hostname,
      hostname.replace(/^.*(?=\.\w*\.\w*$)/, ''),
    ];

    domains = [...new Set(domains)];

    let cookie =
      {
        url: url.origin,
        expirationDate: Math.floor(expiration / 1000),
        path: '/',
        secure: true,
        value: TCString,
      };

    for (const name of standardCookies) {
      cookie.name = name;
      for (const [, domain] of domains.entries()) {
        cookie.domain = domain;
        browser.cookies.set(cookie).catch(onError);
      }
    }

    return cookie;
  }

  /**
   *
   * @param values {{cookie: *, TCString: string}}
   * @returns {{path: string, domain: *, name, secure: boolean, value: *, url: string, expirationDate: number}}
   */
  function storeNonStandardCookie (values) {
    const cookie =
      {
        name: values.cookie.name,
        domain: values.cookie.domain,
        url: url.origin,
        expirationDate: Math.floor(expiration / 1000),
        path: '/',
        secure: true,
        value: values.cookie.value.replace(values.TCString, TCString),
      };

    browser.cookies.set(cookie).catch(onError);

    return cookie;
  }

  function storeCookiesClosingBanner (cookie) {
    const cookies = [
      { name: 'OptanonAlertBoxClosed', value: (new Date()).toISOString() },
    ];

    for (const c of cookies) {
      cookie.name = c.name;
      cookie.value = c.value;
      browser.cookies.set(cookie).catch(onError);
    }
  }
}

/**
 *
 * @param localStorageItems
 * @param TCString
 * @returns {{}}
 */
function updateLocalStorageTCStrings(localStorageItems, TCString) {
  const regex = /(%27)?[A-Za-z0-9_-]{39,}(%27)?/g;

  const updatedItems = {};

  for (const [key, value] of Object.entries(localStorageItems)) {
    const matches = value.match(regex);

    if (!matches) {
      continue;
    }

    let updatedValue = value;
    for (const match of matches) {
      try {
        let cleared = match.replace('%27', '');

        TCStringParse(cleared);
        updatedValue = updatedValue.replace(cleared, TCString);
      } catch (e) {}
    }

    if (value !== updatedValue) {
      updatedItems[key] = updatedValue;
    }
  }

  console.log(updatedItems);
  return updatedItems;
}

/**
 *
 * @param domain
 * @returns {{}}
 */
function createDomainOptions (domain) {
  let purposes = [];
  let specialFeatures = [];

  for (let i = 0; i < PURPOSES_COUNT; i++) {
    purposes.push(GLOBAL_VALUE);
  }

  for (let i = 0; i < SPECIAL_FEATURES_COUNT; i++) {
    specialFeatures.push(GLOBAL_VALUE);
  }

  let options = {};
  options[domain] = {};
  options[domain][PURPOSES_OPTIONS] = purposes;
  options[domain][SPECIAL_FEATURES_OPTIONS] = specialFeatures;

  browser.storage.sync.set(options).catch(onError);

  return options;
}