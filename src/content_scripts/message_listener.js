browser.runtime.onMessage.addListener(messageListener);

function messageListener (message) {
  if (!message.hasOwnProperty('command')) {
    console.error('Attribute \'command\' is missing in message.');
    return;
  }

  if (!message.hasOwnProperty('eventName')) {
    console.error('Attribute \'eventName\' is missing in message.');
    return;
  }

  return new Promise(resolve => {
    __tcfapi(message.command, message.eventName, (data, success) => {
      resolve({ data: data, success: success });
    });
  });
}