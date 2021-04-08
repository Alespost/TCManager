function displayTCContent (TCData) {
  displayHeaders();

  displayCMPData(TCData.cmpId);
  displayListItems(TCData.purpose.consents, 'purpose');
  displayListItems(TCData.specialFeatureOptins, 'special_feature');
  displayVendors(TCData.vendor.consents);
}

function displayHeaders () {
  document.getElementById('cmp_header').innerText = localizedMessage('cmp_header');
  document.getElementById('consent_header').innerText = localizedMessage('consent_header');
  document.getElementById('purposes_header').innerText = localizedMessage('purposes_header');
  document.getElementById('special_features_header').innerText = localizedMessage('special_features_header');
  document.getElementById('vendors_header').innerText = localizedMessage('vendors_header');
  document.getElementById('vendor_list_header').innerText = localizedMessage('vendor_list_header');
  document.getElementById('vendor_list_version').innerText = localizedMessage('vendor_list_version') + ': ';
  document.getElementById('vendor_count').innerText = localizedMessage('vendor_count') + ': ';
}

function displayCMPData (cmpId) {
  openCMPList().then(jsonResponse => {
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

function displayNoTCFMessage () {
  document.getElementById('no_tcf_message').innerText = localizedMessage('no_tcf');
}

function displayListItems (items, listIdPrefix) {
  for (const [key, value] of Object.entries(items)) {
    if (value === true) {
      const item = document.createElement('li');
      item.setAttribute('value', key);
      item.innerText = localizedMessage(listIdPrefix + key);

      const description = document.createElement('span');
      description.classList.add('question_icon');
      description.title = localizedMessage(listIdPrefix + key + '_description')
      description.innerHTML = ' ';
      item.appendChild(description);

      document.getElementById(listIdPrefix + '_list').appendChild(item);
    }
  }
}

function displayVendors(vendors) {
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