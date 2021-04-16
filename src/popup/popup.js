document.addEventListener('DOMContentLoaded', (event) => {
  pingAndFetch();

  document.getElementById('options_button').addEventListener('click', function (e) {
    browser.runtime.openOptionsPage();
    window.close();
  });
});

function pingAndFetch () {
  sendPingMessage();
}

function pingHandler (response) {
  if (response === undefined) {
    sendPingMessage();
    return;
  }

  if (response.data !== false && response.data.cmpLoaded) {
    fetchTCData();
  } else {
    displayNoTCFMessage();
  }
}

function fetchTCData () {
  sendGetTCDataMessage();
}

function fetchHandler (response) {
  if (response === undefined || !response.success) {
    sendGetTCDataMessage();
    return;
  }

  if (!response.data) {
    return;
  }

  displayTCContent(response.data);
}

function sendPingMessage () {
  const message = { command: 'ping', eventName: 'tcfapiEvent' };
  sendMessage(message, pingHandler);
}

function sendGetTCDataMessage () {
  const message = { command: 'getTCData', eventName: 'tcfapiEvent' };
  sendMessage(message, fetchHandler);
}

function sendMessage (message, callback) {
  const query = browser.tabs.query(
    {
      currentWindow: true,
      active: true,
    });

  query.then(tabs => {
    browser.tabs.sendMessage(tabs[0].id, message).then(callback);
  });
}
