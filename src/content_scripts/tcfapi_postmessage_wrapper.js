"use strict";

init();

/**
 * Source: https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#is-there-a-sample-iframe-script-call-to-the-cmp-api
 */
function init() {
    /** if we locate the CMP iframe we will reference it with this */
    let cmpFrame;

    /** map of calls */
    const cmpCallbacks = {};

    locateCmpFrame();

    /**
     * Set up a __tcfapi proxy method to do the postMessage and map the callback.
     * From the caller's perspective, this function behaves identically to the
     * CMP API's __tcfapi call
     */
    window.__tcfapi = function (cmd, version, callback, arg) {
        if (!cmpFrame) {
            locateCmpFrame();
        }

        if (!cmpFrame) {
            callback(false, false);
        } else {
            const callId = Math.random() + '';
            const msg = {
                __tcfapiCall: {
                    command: cmd,
                    parameter: arg,
                    version: version,
                    callId: callId,
                },
            };

            /**
             * map the callback for lookup on response
             */
            cmpCallbacks[callId] = callback;
            cmpFrame.postMessage(msg, '*');
        }
    };

    window.addEventListener('message', postMessageHandler, false);

    function postMessageHandler(event) {

        /**
         * when we get the return message, call the mapped callback
         */
        let json = {};

        try {

            /**
             * if this isn't valid JSON then this will throw an error
             */
            json = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch (ignore) {
        }

        const payload = json.__tcfapiReturn;

        if (payload) {

            /**
             * classes we care about will have a payload
             */
            if (typeof cmpCallbacks[payload.callId] === 'function') {

                /**
                 * call the mapped callback and then remove the reference
                 */
                cmpCallbacks[payload.callId](payload.returnValue, payload.success);
                cmpCallbacks[payload.callId] = null;
            }
        }
    }

    function locateCmpFrame() {
        let frame = window;

        while (frame) {
            try {

                /**
                 * throws a reference error if no frames exist
                 */
                if (frame.frames['__tcfapiLocator']) {
                    cmpFrame = frame;
                    break;
                }
            } catch (ignore) {
            }

            if (frame === window.top) {
                break;
            }

            frame = frame.parent;
        }
    }
}