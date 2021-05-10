/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

// Register listener for messages from popup.js
browser.runtime.onMessage.addListener(messageListener);

/**
 * Call API with command received in message.
 * Response with data retrieved from CMP API.
 */
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