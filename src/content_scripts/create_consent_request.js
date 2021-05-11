/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

createConsentRequest();
closeBanner();

/**
 * Check if web is using TCF and CMP API is loaded.
 * Checking is performed at 500 ms intervals for up to 15 s.
 * If website is using TCF, then send request to create consent to background script.
 */
function createConsentRequest () {
  let cmpReady = false;
  let interval = setInterval(ping, 500);
  let timeout = setTimeout(
    () => {
      clearInterval(interval);
    },
    15000,
  );

  /**
   * Check if CMP API is present and fully loaded.
   */
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

  /**
   * Get data about CMP and local storage items and send request to background script.
   */
  function getDataAndSendRequest () {
    __tcfapi('getTCData', 'tcfapiRequestEvent', handler);

    function handler (data, success) {
      if (!success) {
        return;
      }

      clearInterval(interval);
      clearTimeout(timeout);

      const message = {
        cmpId: data.cmpId,
        cmpVersion: data.cmpVersion ?? 1,
        publisherCC: data.publisherCC ?? 'GB',
        url: location.href,
      };

      getLocalStorageItems(items => {
        message.localStorageItems = items;
        browser.runtime.sendMessage(message).then(updateItems, onError);
      });

    }
  }
}

/**
 * Inject CSS to block cookie banners on some websites.
 */
function closeBanner () {
  const style = document.createElement('style');

  style.innerText =
    '#gdpr-consent-tool-wrapper,' +
    '#qc-cmp2-container,' +
    '#uniccmp,' +
    'sra-cmp-layout' +
    '{' +
    '  display: none !important;' +
    '}';

  const parent = document.body;
  parent.insertBefore(style, parent.firstChild);
}