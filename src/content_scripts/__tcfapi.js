/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

/**
 * Inject code to access CMP API. Pass result to the callback.
 */
function __tcfapi (command, eventName, callback) {
  if (typeof callback !== 'function') {
    return;
  }

  const parent = locateCmpFrame();

  /*
   * Code accessing CMP API, that will be injected to the page.
   * Data are returned via CustomEvent.
   */
  const code = 'if (typeof __tcfapi !== \'function\') {\n' +
    `               document.dispatchEvent(new CustomEvent(\'${eventName}\', {\n` +
    '                   detail: {data: false, success: false}\n' +
    '               }));\n' +
    '            } else {\n' +
    `               __tcfapi(\'${command}\', 2, (returnData, success) => {\n` +
    `                    document.dispatchEvent(new CustomEvent(\'${eventName}\', {\n` +
    '                       detail: {data: returnData, success: success}\n' +
    '                    }));\n' +
    '               });\n' +
    '            }';


  document.addEventListener(eventName, eventListener);
  inject(code, parent);

  function eventListener (e) {
    document.removeEventListener(eventName, eventListener);
    callback(e.detail.data, e.detail.success);
  }
}

/**
 * Locate frame with name '__tcfapiLocator' and return its parent element.
 * If no such frame is found, return document element.
 */
function locateCmpFrame () {
  let locatorFrames = document.getElementsByName('__tcfapiLocator');

  if (locatorFrames.length === 1) {
    return locatorFrames[0].parentElement;
  }

  return document.documentElement;
}