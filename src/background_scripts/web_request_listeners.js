/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

// Register listeners only if filterResponseData function is available.
if (typeof browser.webRequest.filterResponseData === 'function') {
  /**
   * Patterns:
   * consensu.org - Domain defined in TCF as posibility to store TC String.
   * zdconsent.js - Script of CMP Evidon. It contains predefined TC Strings.
   * tcfv2 - CMP SourcePoint Technologies. Response contains predefined TC Strings.
   */
  browser.webRequest.onBeforeRequest.addListener(
    replaceTCStrings,
    { urls: ['*://*.consensu.org/*', '*://*/*zdconsent.js', '*://*/*tcfv2*'] },
    ['blocking'],
  );

  // Blocking banner of Evidon CMP.
  browser.webRequest.onBeforeRequest.addListener(
    cancelRequest,
    { urls: ['*://*/*evidon-barrier.js'] },
    ['blocking'],
  );
}

// Blocking banner of CMP Quantcast International.
browser.webRequest.onBeforeRequest.addListener(
  cancelRequest,
  { urls: ['https://quantcast.mgr.consensu.org/tcfv2/*/cmp2ui-en.js'] },
  ['blocking'],
);

/**
 * Cancel HTTP request
 */
function cancelRequest (details) {
  console.log('Canceling request: ' + details.url);
  return { cancel: true };
}

/**
 * Find and replace TC Strings in HTTP response.
 */
function replaceTCStrings (details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let encoder = new TextEncoder();

  let data = [];

  // Load HTTP response data.
  filter.ondata = event => {
    data.push(event.data);
  };

  // Full HTTP response loaded.
  filter.onstop = async event => {
    let blob = new Blob(data);
    let str = await blob.text();

    const url = new URL(details.originUrl);

    // Find TC String candidates.
    const matches = str.match(/(%27)?[A-Za-z0-9_-]{39,}(%27)?/g);

    if (!Array.isArray(matches) || !matches) {
      filter.write(encoder.encode(str));
      filter.close();
      return;
    }

    // Get data about CMP from TC String.
    let cmpInfo;
    for (let match of matches) {
      try {
        const cleared = match.replace('%27', '');
        const TCModel = TCStringParse(cleared).core;
        cmpInfo = {
          cmpId: TCModel.cmpId,
          cmpVersion: TCModel.cmpVersion ?? 1,
          publisherCC: TCModel.publisherCountryCode ?? 'GB',
        };

        break;
      } catch (e) {}
    }

    // No TC String found.
    if (!cmpInfo) {
      filter.write(encoder.encode(str));
      filter.close();
      return;
    }

    getOptions(url.hostname)
      .then(createTCModel.bind(null, cmpInfo))
      .then(createBitField)
      .then(encode)
      .then(TCString => {
        // Replace TC Strings in HTTP response.
        for (let match of matches) {
          try {
            const cleared = match.replace('%27', '');
            TCStringParse(cleared); // Throws exception if it is not valid TC String.

            str = str.replace(cleared, TCString);
          } catch (e) {}
        }

        filter.write(encoder.encode(str));
        filter.close();
      });
  };
}