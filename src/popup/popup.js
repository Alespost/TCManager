document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('options_button').addEventListener('click', function (e) {
    browser.runtime.openOptionsPage();
    window.close();
  });

  getConsentData();
});

function getConsentData () {
  sendPingMessage();
}

function sendPingMessage () {
  const message = { command: 'ping', eventName: 'tcfapiEvent' };
  sendMessage(message, pingListener);
}

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

function sendGetTCDataMessage () {
  const message = { command: 'getTCData', eventName: 'tcfapiEvent' };
  sendMessage(message, fetchListener);
}

function fetchListener (response) {
  if (response === undefined || !response.success) {
    sendGetTCDataMessage();
    return;
  }

  if (!response.data) {
    return;
  }

  displayTCContent(response.data);
}

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
