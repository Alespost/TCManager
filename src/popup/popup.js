/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

document.addEventListener('DOMContentLoaded', event => {
  document.getElementById('options_button').addEventListener('click', e => {
    browser.runtime.openOptionsPage();
    window.close();
  });

  getConsentData();
});

function getConsentData () {
  sendPingMessage();
}

/**
 * Send message with ping command to check if CMP is present on page
 * and if it is fully loaded.
 */
function sendPingMessage () {
  const message = { command: 'ping', eventName: 'tcfapiEvent' };
  sendMessage(message, pingListener);
}

/**
 * Check response data.
 * If CMP is loaded, send request to get consent data.
 * If page is not using TCF, display relevant info message.
 */
function pingListener (response) {
  if (response === undefined || (response.data && !response.data.cmpLoaded)) {
    sendPingMessage();
    return;
  }

  if (response.data !== false) {
    sendGetTCDataMessage();
  } else {
    displayNoTCFMessage();
  }
}

/**
 * Send request to get consent data.
 */
function sendGetTCDataMessage () {
  const message = { command: 'getTCData', eventName: 'tcfapiEvent' };
  sendMessage(message, getTCDataListener);
}

/**
 * Check retrieved consent data.
 * If data are valid, display them into the popup.
 */
function getTCDataListener (response) {
  if (response === undefined || !response.success) {
    sendGetTCDataMessage();
    return;
  }

  if (!response.data) {
    return;
  }

  displayTCContent(response.data);
}

/**
 * Send message to current tab.
 */
function sendMessage (message, listener) {
  const query = browser.tabs.query(
    {
      currentWindow: true,
      active: true,
    });

  query.then(tabs => {
    browser.tabs.sendMessage(tabs[0].id, message).then(listener, displayNoTCFMessage);
  });
}
