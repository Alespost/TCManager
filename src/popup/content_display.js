"use strict";

function displayTCContent(TCData)
{
    displayHeaders();

    displayCMPData(TCData.cmpId);
    displayListItems(TCData.purpose.consents, 'purpose');
    displayListItems(TCData.specialFeatureOptins, 'special_feature');
}

function displayHeaders() {
    document.getElementById('cmp_header').innerText = localizedMessage('cmp_header');
    document.getElementById('consent_header').innerText = localizedMessage('consent_header');
    document.getElementById('purposes_header').innerText = localizedMessage('purposes_header');
    document.getElementById('special_features_header').innerText = localizedMessage('special_features_header');
}

function displayListItems(items, listIdPrefix) {
    for (const [key, value] of Object.entries(items)) {
        if (value === true) {
            const item = document.createElement('dt')
            item.innerText = key + ": " + localizedMessage(listIdPrefix + key);

            document.getElementById(listIdPrefix + '_list').appendChild(item);
        }
    }
}

function displayCMPData(cmpId) {
    let url = browser.runtime.getURL('resources/cmp-list.json');
    fetch(url)
        .then(response => response.json())
        .then(jsonResponse => {
            let cmpName;
            if (jsonResponse.cmps[cmpId]) {
                cmpName = jsonResponse.cmps[cmpId].name;
            } else {
                cmpName = localizedMessage('unknown_cmp');
            }

            document.getElementById('cmp_name').innerText = cmpName;
        });

    document.getElementById('cmp_id').innerText = '(ID:' + cmpId + ')';
}

function displayNoTCFMessage() {
    document.getElementById('no_tcf_message').innerText = localizedMessage('no_tcf');
}