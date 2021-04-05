createConsentRequest();

function createConsentRequest () {
  let cmpReady = false;
  let interval = setInterval(ping, 500);
  let timeout = setTimeout(
    () => {
      clearInterval(interval);
      console.log('Interval cleared by timeout.');
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

      console.log('Timeout and interval cleared.');

      const message = {
        cmpId: data.cmpId,
        cmpVersion: data.cmpVersion ?? 1,
        publisherCC: data.publisherCC ?? 'EN',
        url: location.href,
      };

      browser.runtime.sendMessage(message);
    }
  }
}