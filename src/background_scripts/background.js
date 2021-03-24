"use strict";

browser.runtime.onInstalled.addListener(
    details => {
        initOptions();
    });

browser.webRequest.onBeforeRequest.addListener(
    listener,
    {urls: ["*://*.consensu.org/*", "https://login.seznam.cz/api/v1/euconsent"]},
    ["blocking"]
    //([A-Za-z0-9_-]{4}){10,}(\.?[^\\ "]+)+
);

function listener(details)
{
    if (typeof browser.webRequest.filterResponseData !== 'function') {
        return;
    }

    let encoder = new TextEncoder();
    let decoder = new TextDecoder('utf-8');

    console.log(details.url);
}


function initOptions() {
    let getting = browser.storage.sync.get(GLOBAL_OPTIONS);
    return getting.then(onSuccess, onError);

    function onSuccess(result) {
        if (result.hasOwnProperty(GLOBAL_OPTIONS)) {
            return;
        }

        setDefaultOptions();
    }

    function onError(error) {
        console.error(`Error: ${error}`);
        return false;
    }

    function setDefaultOptions() {
        let purposes = [];
        for (let i = 0; i < 10; i++) {
            purposes.push(false);
        }

        let specialFeatures = [];
        for (let i = 0; i < 2; i++) {
            specialFeatures.push(false);
        }

        let globalOptions = {};
        globalOptions[GLOBAL_OPTIONS] = {}
        globalOptions[GLOBAL_OPTIONS][PURPOSES_OPTIONS] = purposes;
        globalOptions[GLOBAL_OPTIONS][SPECIAL_FEATURES_OPTIONS] = specialFeatures;
        browser.storage.sync.set(globalOptions);
    }
}