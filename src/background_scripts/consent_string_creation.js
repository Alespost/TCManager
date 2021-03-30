"use strict";

browser.runtime.onMessage.addListener(consentRequestMessageHandler);

/**
 *
 * @param request
 * @param sender
 * @param sendResponse
 */
function consentRequestMessageHandler(request, sender, sendResponse) {
    const url = new URL(request.url);

    getOptions(url.hostname)
        .then(createTCModel.bind(null, request))
        .then(createBitField)
        .then(encode)
        .then(storeConsent.bind(null, url));
}

/**
 *
 * @param {string} domain
 * @returns {PromiseLike<{} | *[]> | Promise<{} | *[]>}
 */
function getOptions(domain) {
    return browser.storage.sync.get([GLOBAL_OPTIONS, domain])
        .then(onSuccess, onError);

    /**
     * @param result
     * @returns {{}}
     */
    function onSuccess(result) {
        const domainOptions = result[domain] ?? createDomainOptions(domain)[domain];
        const globalOptions = result[GLOBAL_OPTIONS];

        const purposes = [];
        for (const [index, value] of domainOptions[PURPOSES_OPTIONS].entries()) {
            if (value !== null) {
                purposes.push(domainOptions[PURPOSES_OPTIONS][index]);
            } else {
                purposes.push(globalOptions[PURPOSES_OPTIONS][index]);
            }
        }

        const specialFeatures = [];
        for (const [index, value] of domainOptions[SPECIAL_FEATURES_OPTIONS].entries()) {
            if (value !== null) {
                specialFeatures.push(value);
            } else {
                specialFeatures.push(globalOptions[SPECIAL_FEATURES_OPTIONS][index]);
            }
        }

        const requiredOptions = {};
        requiredOptions[PURPOSES_OPTIONS] = purposes;
        requiredOptions[SPECIAL_FEATURES_OPTIONS] = specialFeatures;

        return requiredOptions;
    }

    /**
     * @param error
     * @returns {*[]}
     */
    function onError(error) {
        console.error(`Error: ${error}`);
        return [];
    }
}

/**
 *
 * @param data
 * @param options
 * @returns {object}
 */
function createTCModel(data, options) {
    const vendorConsent = {
        maxVendorId: 1, //TODO
        isRangeEncoding: 0, // BitField
        bitField: [false], //TODO
    }

    const vendorLI = {
        maxVendorId: 1, //TODO
        isRangeEncoding: 0, // BitField
        bitField: [false], //TODO
    }

    const timestamp = Math.round((new Date()).getTime()/100);

    return {
        version: 2,
        created: timestamp,
        lastUpdated: timestamp,
        cmpId: data.cmpId,
        cmpVersion: data.cmpVersion,
        consentScreen: 1,
        consentLanguage: consentLanguage(),
        vendorListVersion: 80, //TODO
        tcfPolicyVersion: 2,
        isServiceSpecific: 1,
        nonStandardStacks: 0,
        specialFeatureOptIns: options[SPECIAL_FEATURES_OPTIONS],
        purposesConsent: options[PURPOSES_OPTIONS],
        purposesLITransparency: options[PURPOSES_OPTIONS],
        purposeOneTreatment: 0,
        publisherCC: data.publisherCC,
        vendorConsent: vendorConsent,
        vendorLI: vendorLI,
        numPubRestrictions: 0
    }

    function consentLanguage() {
        return browser.i18n
            .getUILanguage()
            .substr(0,2)
            .toUpperCase();
    }
}

/**
 * https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20Consent%20string%20and%20vendor%20list%20formats%20v2.md#the-core-string
 * @param TCModel
 * @returns {string}
 */
function createBitField(TCModel) {
    const BIT_LEN_1 = 1;
    const BIT_LEN_6 = 6;
    const BIT_LEN_12 = 12;
    const BIT_LEN_16 = 16;
    const BIT_LEN_24 = 24;
    const BIT_LEN_36 = 36;

    let bitField = '';

    bitField += intToBitField(TCModel.version, BIT_LEN_6);
    bitField += intToBitField(TCModel.created, BIT_LEN_36);
    bitField += intToBitField(TCModel.lastUpdated, BIT_LEN_36);
    bitField += intToBitField(TCModel.cmpId, BIT_LEN_12);
    bitField += intToBitField(TCModel.cmpVersion, BIT_LEN_12);
    bitField += intToBitField(TCModel.consentScreen, BIT_LEN_6);
    bitField += stringToBitField(TCModel.consentLanguage, BIT_LEN_12);
    bitField += intToBitField(TCModel.vendorListVersion, BIT_LEN_12);
    bitField += intToBitField(TCModel.tcfPolicyVersion, BIT_LEN_6);
    bitField += intToBitField(TCModel.isServiceSpecific, BIT_LEN_1);
    bitField += intToBitField(TCModel.nonStandardStacks, BIT_LEN_1);
    bitField += booleanArrayToBitField(TCModel.specialFeatureOptIns, BIT_LEN_12);
    bitField += booleanArrayToBitField(TCModel.purposesConsent, BIT_LEN_24);
    bitField += booleanArrayToBitField(TCModel.purposesLITransparency, BIT_LEN_24);
    bitField += intToBitField(TCModel.purposeOneTreatment, BIT_LEN_1);
    bitField += stringToBitField(TCModel.publisherCC, BIT_LEN_12);

    bitField += intToBitField(TCModel.vendorConsent.maxVendorId, BIT_LEN_16);
    bitField += intToBitField(TCModel.vendorConsent.isRangeEncoding, BIT_LEN_1);
    bitField += booleanArrayToBitField(TCModel.vendorConsent.bitField, TCModel.vendorConsent.maxVendorId);

    bitField += intToBitField(TCModel.vendorLI.maxVendorId, BIT_LEN_16);
    bitField += intToBitField(TCModel.vendorLI.isRangeEncoding, BIT_LEN_1);
    bitField += booleanArrayToBitField(TCModel.vendorLI.bitField, TCModel.vendorLI.maxVendorId);

    bitField += intToBitField(TCModel.numPubRestrictions, BIT_LEN_12);

    return bitField;
}

/**
 * https://github.com/InteractiveAdvertisingBureau/iabtcf-es/blob/master/modules/core/src/encoder/Base64Url.ts
 * @param bitString
 * @returns {string}
 */
function encode(bitString)
{
    const DICT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const PADDING = 24;
    const BASIS = 6;

    const padding = bitString.length % PADDING;
    bitString += padding ? '0'.repeat(24 - padding) : '';

    let TCString = '';

    for (let i = 0; i < bitString.length; i += BASIS) {
        const index = parseInt(bitString.substr(i, BASIS), 2);
        TCString += DICT[index];
    }

    return TCString;
}

/**
 *
 * @param url
 * @param TCString
 */
function storeConsent(url, TCString)
{
    storeCookies(TCString, url);
}

/**
 *
 * @param TCString
 * @param url
 */
function storeCookies(TCString, url)
{
    const cookieNames = ['euconsent-v2', 'eupubconsent-v2', '__cmpconsentx11319', '__cmpconsent6648'];
    const domain = url.hostname.replace(new RegExp('www'), '');

    const expiration = new Date();
    expiration.setFullYear(expiration.getFullYear() + 1);

    const cookie =
        {
            domain: domain,
            url: url.origin,
            expirationDate: Math.floor(expiration / 1000 ),
            path: '/',
            secure: true,
            value: TCString
        };

    for (const name of cookieNames) {
        cookie.name = name;
        browser.cookies.set(cookie);
    }

    storeCookiesClosingBanner(cookie);

    console.log('Cookies stored.');

    function storeCookiesClosingBanner(cookie)
    {
        const cookies = [
            {name: 'OptanonAlertBoxClosed', value: (new Date()).toISOString()},
            {name: '__cmpcvcx11319', value: 'U'},
            {name: '__cmpcvcu6648', value: 'U'},
        ];

        for (const c of cookies) {
            cookie.name = c.name;
            cookie.value = c.value;
            browser.cookies.set(cookie);
        }
    }
}

/**
 *
 * @param domain
 * @returns {{}}
 */
function createDomainOptions(domain) {
    let purposes = [];
    let specialFeatures = [];

    for (let i = 0; i < PURPOSES_COUNT; i++) {
        purposes.push(undefined);
    }

    for(let i = 0; i < SPECIAL_FEATURES_COUNT; i++) {
        specialFeatures.push(undefined);
    }

    let options = {};
    options[domain] = {};
    options[domain][PURPOSES_OPTIONS] = purposes;
    options[domain][SPECIAL_FEATURES_OPTIONS] = specialFeatures;

    browser.storage.sync.set(options);

    return options;
}