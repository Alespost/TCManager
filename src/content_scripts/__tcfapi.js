function __tcfapi (command, eventName, callback) {
  if (typeof callback !== 'function') {
    return;
  }

  const parent = locateCmpFrame();
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

function locateCmpFrame () {
  let locatorFrames = document.getElementsByName('__tcfapiLocator');

  if (locatorFrames.length === 1) {
    return locatorFrames[0].parentElement;
  }

  return document.documentElement;
}