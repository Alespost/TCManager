browser.runtime.onInstalled.addListener(
  details => {
    initOptions();
  });

/*browser.webRequest.onBeforeRequest.addListener(
    listener,
    {urls: ["*://!*.consensu.org/!*", "https://login.seznam.cz/api/v1/euconsent"]},
    ['blocking']
    //([A-Za-z0-9_-]{4}){10,}(\.?[^\\ "]+)+
);

function listener(details)
{
    console.log(details.url);

    if (typeof browser.webRequest.filterResponseData !== 'function') {
        return;
    }

    let domain = new URL(details.originUrl);
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let encoder = new TextEncoder();
    let decoder = new TextDecoder('utf-8');

    filter.ondata = event => {
        let str = decoder.decode(event.data, {stream: true});
        // Just change any instance of Example in the HTTP response
        // to WebExtension Example.
          str = str.replace(/window\.cmp_config_data_cs="[^"]*"/g, 'window.cmp_config_data_cs=\"CPD3plpPD3plpAfYJBCSBQCgAAgAAAgAAAigAAgAAgAA\"');
        filter.write(encoder.encode(str));
        filter.disconnect();
    }

    return {};

}*/

function initOptions () {
  let getting = browser.storage.sync.get(GLOBAL_OPTIONS);
  return getting.then(onSuccess, onError);

  function onSuccess (result) {
    if (result.hasOwnProperty(GLOBAL_OPTIONS)) {
      return;
    }

    setDefaultOptions();
  }

  function onError (error) {
    console.error(`Error: ${error}`);
    return false;
  }

  function setDefaultOptions () {
    let purposes = [];
    for (let i = 0; i < 10; i++) {
      purposes.push(false);
    }

    let specialFeatures = [];
    for (let i = 0; i < 2; i++) {
      specialFeatures.push(false);
    }

    let globalOptions = {};
    globalOptions[GLOBAL_OPTIONS] = {};
    globalOptions[GLOBAL_OPTIONS][PURPOSES_OPTIONS] = purposes;
    globalOptions[GLOBAL_OPTIONS][SPECIAL_FEATURES_OPTIONS] = specialFeatures;
    browser.storage.sync.set(globalOptions);
  }
}