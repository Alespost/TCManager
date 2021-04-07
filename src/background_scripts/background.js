browser.runtime.onInstalled.addListener(
  details => {
    initOptions();
  });

function initOptions () {
  let getting = browser.storage.sync.get();
  return getting.then(onSuccess, onError);

  function onSuccess (result) {
    // browser.storage.sync.remove(Object.keys(result));

    if (!result.hasOwnProperty(GLOBAL_OPTIONS)) {
      console.log('setting global');
      setDefaultOptions();
    }

    if (result.hasOwnProperty(VENDOR_OPTIONS)) {
      console.log('setting vendors')
      setDefaultVendorOptions();
    }
  }

  function onError (error) {
    console.error(`Error: ${error}`);
    return false;
  }

  function setDefaultOptions () {
    const purposes = Array(PURPOSES_COUNT).fill(OBJECTION);
    const specialFeatures = Array(SPECIAL_FEATURES_COUNT).fill(OBJECTION);

    const globalOptions = {};
    globalOptions[GLOBAL_OPTIONS] = {};
    globalOptions[GLOBAL_OPTIONS][PURPOSES_OPTIONS] = purposes;
    globalOptions[GLOBAL_OPTIONS][SPECIAL_FEATURES_OPTIONS] = specialFeatures;

    browser.storage.sync.set(globalOptions);
  }

  function setDefaultVendorOptions () {
    let vendorOptions = {};
    vendorOptions[VENDOR_OPTIONS] = {};
    vendorOptions[VENDOR_OPTIONS][GLOBAL_OPTIONS] = OBJECTION;

    openVendorList().then(jsonResponse => {
      for (const [key, vendor] of Object.entries(jsonResponse.vendors)) {
        vendorOptions[VENDOR_OPTIONS][vendor.id] = GLOBAL_VALUE;
      }

      browser.storage.sync.set(vendorOptions);
    });
  }
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {urls: ["*://*.consensu.org/*"]},
);

browser.webRequest.onBeforeRequest.addListener(
  details => {console.log('blocking: ' + details.url); return {cancel:true};},
  {urls: ["https://quantcast.mgr.consensu.org/tcfv2/*/cmp2ui-en.js"]},
  ['blocking']
);

function listener(details)
{
    console.log(details.url);

    /*if (typeof browser.webRequest.filterResponseData !== 'function') {
        return;
    }

    let filter = browser.webRequest.filterResponseData(details.requestId);
    let encoder = new TextEncoder();
    let decoder = new TextDecoder('utf-8');

    filter.ondata = event => {
        let str = decoder.decode(event.data, {stream: false});
        console.log(str);

        const json = JSON.parse(str);
        json.euconsent = JSON.parse(json.euconsent);
        json.euconsent.v2.encodedCookie = 'CPEE2DqPEE2DqD3ACBCSBUCgAEAAAEAAAAAAHrAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        json.euconsent.v2.allowedPurposeIds = [2];
        json.euconsent.v2.allowedVendorIds = [];
        console.log(json);
        json.euconsent = JSON.stringify(json.euconsent);
        str = JSON.stringify(json);
        console.log(str);
        // Just change any instance of Example in the HTTP response
        // to WebExtension Example.

        // str = str.replace(/window\.cmp_config_data_cs="[^"]*"/g, 'window.cmp_config_data_cs=\"CPD3plpPD3plpAfYJBCSBQCgAAgAAAgAAAigAAgAAgAA\"');
        filter.write(encoder.encode(str));
        filter.disconnect();
    }

    return {};*/
}