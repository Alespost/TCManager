/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

/**
 * Display retrieved information about consent stored on current web.
 */
function displayTCContent (TCData) {
  displayHeaders();

  // If data does not contain required attributes, try to obtain them by parsing TC String.
  if (TCData.tcString && (TCData.purpose || !TCData.specialFeatureOptins || !TCData.vendor)) {
    try {
      const TCModel = TCStringParse(TCData.tcString).core;

      TCData.purpose = { consents: TCModel.purposeConsents };
      TCData.specialFeatureOptins = TCModel.specialFeatureOptins;
      TCData.vendor = { consents: TCModel.vendorConsents };
    } catch (e) {
      console.exception(e);
    }
  }

  try {
    displayCMPData(TCData.cmpId);
    displayListItems(TCData.purpose.consents, 'purpose');
    displayListItems(TCData.specialFeatureOptins, 'special_feature');
    displayVendors(TCData.vendor.consents);
  } catch (e) {}
}

/**
 * Display localized headers in popup.
 */
function displayHeaders () {
  document.getElementById('cmp_header').innerText = getMessage('cmp_header');
  document.getElementById('consent_header').innerText = getMessage('consent_header');
  document.getElementById('purposes_header').innerText = getMessage('purposes_header');
  document.getElementById('special_features_header').innerText = getMessage('special_features_header');
  document.getElementById('vendors_header').innerText = getMessage('vendors_header');
  document.getElementById('vendor_list_header').innerText = getMessage('vendor_list_header');
  document.getElementById('vendor_list_version').innerText = getMessage('vendor_list_version') + ': ';
  document.getElementById('vendor_count').innerText = getMessage('vendor_count') + ': ';
}

/**
 * Display ID and name of CMP used on current web.
 * CMP name is obtained from cmp-list.json by CMP ID.
 */
function displayCMPData (cmpId) {
  openCMPList().then(jsonResponse => {
    let cmpName;
    if (jsonResponse.cmps[cmpId]) {
      cmpName = jsonResponse.cmps[cmpId].name;
    } else {
      cmpName = getMessage('unknown_cmp');
    }

    document.getElementById('cmp_name').innerText = cmpName;
  });

  document.getElementById('cmp_id').innerText = '(ID:' + cmpId + ')';
}

/**
 * Display message that the page does not use TCF.
 */
function displayNoTCFMessage () {
  document.getElementById('no_tcf_message').innerText = getMessage('no_tcf');
}

/**
 * Display purposes/special features for which consent has been given.
 */
function displayListItems (items, listIdPrefix) {
  for (const [key, value] of Object.entries(items)) {
    if (value === true) {
      const item = document.createElement('li');
      item.setAttribute('value', key);
      item.innerText = getMessage(listIdPrefix + key);

      // icon with purpose/special feature description tooltip
      const description = document.createElement('span');
      description.classList.add('question_icon');
      description.title = getMessage(listIdPrefix + key + '_description');
      description.innerHTML = ' ';
      item.appendChild(description);

      document.getElementById(listIdPrefix + '_list').appendChild(item);
    }
  }
}

/**
 * Display vendors for which consent has been given.
 * Display vendor list.
 * Display count of vendors for which consent has been given.
 */
function displayVendors (vendors) {
  const count = document.createElement('span');
  const version = document.createElement('span');
  const list = document.getElementById('vendor_list');

  openVendorList().then(
    vendorList => {
      version.innerText = vendorList.vendorListVersion;
      vendorList = vendorList.vendors;

      let c = 0;
      for (const [id, value] of Object.entries(vendors)) {
        if (value === true && vendorList.hasOwnProperty(id)) {
          const item = document.createElement('li');
          item.innerText = vendorList[id].name;
          list.appendChild(item);
          c++;
        }
      }

      count.innerText = c;

      if (c !== 0) {
        list.classList.remove('empty');
        document.getElementById('vendor_list_header').classList.remove('hidden');
      }

      document.getElementById('vendor_list_version').appendChild(version);
      document.getElementById('vendor_count').appendChild(count);
    });

}