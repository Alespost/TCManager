function __tcfapi (command, eventName, callback) {
  if (typeof callback !== 'function') {
    return;
  }

  const parent = locateCmpFrame();

  if (parent === null) {
    callback(false, false);
    return;
  }

  const script = document.createElement('script');
  document.addEventListener(eventName, eventHandler);

  script.async = false;
  script.text = `__tcfapi(\'${command}\', 2, (returnData, success) => {\n` +
    `                    console.log(\'injected script: \', \'${command}\', returnData, success);\n` +
    `                    document.dispatchEvent(new CustomEvent(\'${eventName}\', {\n` +
    '                       detail: {data: returnData, success: success}\n' +
    '                    }));' +
    '            \n' +
    '            }); ';

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);

  function eventHandler (e) {
    document.removeEventListener(eventName, eventHandler);
    callback(e.detail.data, e.detail.success);
  }
}

function locateCmpFrame () {
  let locatorFrames = document.getElementsByName('__tcfapiLocator');

  if (locatorFrames.length === 1) {
    return locatorFrames[0].parentElement;
  }

  return null;
}