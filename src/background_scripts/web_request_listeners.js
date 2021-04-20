if (typeof browser.webRequest.filterResponseData === 'function') {
  browser.webRequest.onBeforeRequest.addListener(
    replaceTCStrings,
    { urls: ['*://*.consensu.org/*', '*://*/*zdconsent.js'] },
    ['blocking'],
  );

  browser.webRequest.onBeforeRequest.addListener(
    cancelRequest,
    { urls: ['*://*/*evidon-barrier.js'] },
    ['blocking'],
  );
}

browser.webRequest.onBeforeRequest.addListener(
  cancelRequest,
  { urls: ['https://quantcast.mgr.consensu.org/tcfv2/*/cmp2ui-en.js'] },
  ['blocking'],
);

function cancelRequest (details) {
  console.log('Canceling request: ' + details.url);
  return { cancel: true };
}

function replaceTCStrings (details) {
  console.log(details.url);

  let filter = browser.webRequest.filterResponseData(details.requestId);
  let encoder = new TextEncoder();

  let data = [];
  filter.ondata = event => {
    data.push(event.data);
  };

  filter.onstop = async event => {
    let blob = new Blob(data);
    let str = await blob.text();

    const url = new URL(details.originUrl);
    const matches = str.match(/(%27)?[A-Za-z0-9_-]{39,}(%27)?/g);

    if (!Array.isArray(matches)) {
      filter.write(encoder.encode(str));
      filter.close();
    }

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

    if (!cmpInfo) {
      filter.write(encoder.encode(str));
      filter.close();
    }

    getOptions(url.hostname)
      .then(createTCModel.bind(null, cmpInfo))
      .then(createBitField)
      .then(encode).then(TCString => {

      for (let match of matches) {
        try {
          const cleared = match.replace('%27', '');
          TCStringParse(cleared);

          str = str.replace(cleared, TCString);
        } catch (e) {}
      }

      filter.write(encoder.encode(str));
      filter.close();
    });
  };
}