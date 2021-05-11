/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

browser.runtime.onInstalled.addListener(
  details => {
    initOptions();
  });

/**
 * Init or update purposes and vendor options.
 */
function initOptions () {
  browser.storage.sync.get()
    .then(onSuccess, onError);

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

  /**
   * Create global options with all purposes and special features set to 'objection'.
   */
  function setDefaultOptions () {
    const purposes = Array(PURPOSES_COUNT).fill(OBJECTION);
    const specialFeatures = Array(SPECIAL_FEATURES_COUNT).fill(OBJECTION);

    const globalOptions = {};
    globalOptions[GLOBAL_OPTIONS] = {};
    globalOptions[GLOBAL_OPTIONS][PURPOSES_OPTIONS] = purposes;
    globalOptions[GLOBAL_OPTIONS][SPECIAL_FEATURES_OPTIONS] = specialFeatures;

    browser.storage.sync.set(globalOptions).catch(onError);
  }

  /**
   * Create global options for vendors set to 'objection'.
   * Create default options for all vendors from vendor list.
   */
  function setDefaultVendorOptions () {
    let vendorOptions = {};
    vendorOptions[VENDOR_OPTIONS] = {};
    vendorOptions[VENDOR_OPTIONS][GLOBAL_OPTIONS] = OBJECTION;

    openVendorList().then(jsonResponse => {
      vendorOptions[VENDOR_OPTIONS][VENDOR_OPTIONS] = jsonResponse.vendorListVersion;
      for (const [, vendor] of Object.entries(jsonResponse.vendors)) {
        vendorOptions[VENDOR_OPTIONS][vendor.id] = INHERITED;
      }

      browser.storage.sync.set(vendorOptions).catch(onError);
    }, onError);
  }

  /**
   * Update records of vendor options.
   * Remove options for vendors which are not present in current version of vendor list.
   * Create default options for vendors which were added in current version of vendor list.
   */
  function updateVendorOptions () {
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

            // Removes options for removed vendors.
            for (const [key] of Object.entries(choices)) {
              if (!vendors.hasOwnProperty(key)) {
                delete choices[key];
              }
            }

            // Creates default options for new vendors.
            for (const [, vendor] of Object.entries(vendors)) {
              if (!choices.hasOwnProperty(vendor.id)) {
                choices[vendor.id] = INHERITED;
              }
            }

            choices[VENDOR_OPTIONS] = version;
            choices[GLOBAL_OPTIONS] = global;
            result[VENDOR_OPTIONS] = choices;

            browser.storage.sync.set(result).catch(onError);
          }, onError);
      }, onError);
  }
}