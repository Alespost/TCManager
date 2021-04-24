createConsentRequest();
closeBanner();

function createConsentRequest () {
  let cmpReady = false;
  let interval = setInterval(ping, 500);
  let timeout = setTimeout(
    () => {
      clearInterval(interval);
      // console.log('Interval cleared by timeout.');
    },
    15000,
  );

  function ping () {
    __tcfapi('ping', 'tcfapiRequestEvent', handler);

    function handler (data, success) {
      if (data !== false && data.hasOwnProperty('cmpLoaded')) {
        cmpReady = data.cmpLoaded;
      }

      if (cmpReady) {
        getDataAndSendRequest();
      }
    }
  }

  function getDataAndSendRequest () {
    __tcfapi('getTCData', 'tcfapiRequestEvent', handler);

    function handler (data, success) {
      if (!success) {
        return;
      }

      clearInterval(interval);
      clearTimeout(timeout);

      // console.log('Timeout and interval cleared.');

      const message = {
        cmpId: data.cmpId,
        cmpVersion: data.cmpVersion ?? 1,
        publisherCC: data.publisherCC ?? 'GB',
        url: location.href,
      };

      getLocalStorageItems(items => {
        message.localStorageItems = items;
        browser.runtime.sendMessage(message).then(updateItems);
      });

    }
  }
}

function closeBanner () {
  const style = document.createElement('style');
  style.innerText =
    '#gdpr-consent-tool-wrapper,' +
    '#qc-cmp2-container,' +
    'sra-cmp-layout' +
    '{' +
    '  display: none;' +
    '}';

  const parent = document.body;
  parent.insertBefore(style, parent.firstChild);

}