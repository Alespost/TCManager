browser.runtime.onInstalled.addListener(
  details => {
    initOptions();
  });

function initOptions () {
  let getting = browser.storage.sync.get();
  return getting.then(onSuccess, onError);

  function onSuccess (result) {
    if (!result.hasOwnProperty(GLOBAL_OPTIONS)) {
      setDefaultOptions();
    }

    if (!result.hasOwnProperty(VENDOR_OPTIONS)) {
      setDefaultVendorOptions();
    } else {
      updateVendorOptions();
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
      vendorOptions[VENDOR_OPTIONS][VENDOR_OPTIONS] = jsonResponse.vendorListVersion;
      for (const [, vendor] of Object.entries(jsonResponse.vendors)) {
        vendorOptions[VENDOR_OPTIONS][vendor.id] = GLOBAL_VALUE;
      }

      browser.storage.sync.set(vendorOptions);
    });
  }

  function updateVendorOptions() {
    browser.storage.sync.get(VENDOR_OPTIONS).then(
      result => {
        const choices = result[VENDOR_OPTIONS];
        const global = choices[GLOBAL_OPTIONS];
        delete choices[GLOBAL_OPTIONS];
        delete choices[VENDOR_OPTIONS];

        openVendorList().then(
          vendors => {
            const version = vendors.vendorListVersion;
            vendors = vendors.vendors;
            for (const [key] of Object.entries(choices)) {
              if (!vendors.hasOwnProperty(key)) {
                delete choices[key];
              }
            }

            for (const [, vendor] of Object.entries(vendors)) {
              if (!choices.hasOwnProperty(vendor.id)) {
                choices[vendor.id] = GLOBAL_VALUE;
              }
            }

            choices[VENDOR_OPTIONS] = version;
            choices[GLOBAL_OPTIONS] = global;
            result[VENDOR_OPTIONS] = choices;

            browser.storage.sync.set(result);
          }
        );
      }
  );
  }
}