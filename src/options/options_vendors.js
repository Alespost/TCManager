/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

document.addEventListener('DOMContentLoaded', (event) => {
  displayVendorsOptionsContent();
  restoreOptions();
  document.getElementById('use_global').addEventListener('click', useGlobal);
});

function restoreOptions () {
  browser.storage.sync.get(VENDOR_OPTIONS).then(setCurrentChoices, onError);

  function setCurrentChoices (result) {
    const table = document.getElementById('options_vendors_body');
    table.innerHTML = '';

    const vendorChoices = result[VENDOR_OPTIONS];
    openVendorList().then(jsonResponse => {
      const globalRow = createOptionsRow(null, vendorChoices[GLOBAL_OPTIONS]);
      globalRow.id = GLOBAL_ROW_ID;
      table.appendChild(globalRow);
      displayGlobalOptionsHeader();

      for (const [key, vendor] of Object.entries(jsonResponse.vendors)) {
        const row = createOptionsRow(vendor, vendorChoices[key], vendorChoices[GLOBAL_OPTIONS]);
        table.appendChild(row);
      }
    });
  }

  function createOptionsRow (vendor, choice, global = null) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.classList.add('row_header', 'left');

    if (vendor === null) {
      nameCell.id = 'global_header';
    } else {
      row.id = vendor.id;
      nameCell.innerText = vendor.name;
    }

    row.appendChild(nameCell);

    const idCell = document.createElement('td');
    idCell.classList.add('id');
    if (vendor !== null) {
      idCell.classList.add('right');
      idCell.innerText = vendor.id;
    }

    row.appendChild(idCell);

    const policyUrlCell = document.createElement('td');
    policyUrlCell.classList.add('link');
    if (vendor !== null) {
      const link = document.createElement('a');
      link.href = vendor.policyUrl;
      link.innerText = getMessage('link');
      policyUrlCell.appendChild(link);
    }

    row.appendChild(policyUrlCell);

    setChoice();
    return row;

    function setChoice () {
      const cell = document.createElement('td');

      if (vendor === null) {
        cell.classList.add(GLOBAL_OPTION_CLASS, VENDOR_OPTION_CLASS);
        cell.id = GLOBAL_OPTION_CLASS;
      } else {
        cell.classList.add(OPTION_CLASS);
      }

      cell.setAttribute(VALUE_ATTRIBUTE, choice);
      cell.addEventListener('click', optionClickedListener);

      switch (choice) {
        case CONSENT:
          cell.classList.add(CONSENT_COLOR);
          cell.setAttribute(VALUE_ATTRIBUTE, CONSENT);
          cell.title = getMessage('consent_extended');
          break;
        case OBJECTION:
          cell.classList.add(OBJECTION_COLOR);
          cell.setAttribute(VALUE_ATTRIBUTE, OBJECTION);
          cell.title = getMessage('objection_extended');
          break;
        case INHERITED:
          if (global === CONSENT) {
            cell.classList.add(INHERITED_CONSENT_COLOR);
            cell.title = getMessage('inherited_consent');
          } else {
            cell.classList.add(INHERITED_OBJECTION_COLOR);
            cell.title = getMessage('inherited_objection');
          }
          break;
      }

      row.appendChild(cell);
    }
  }
}

function optionClickedListener (event) {
  const clickedOption = event.target;
  const isGlobal = clickedOption.classList.contains(GLOBAL_OPTION_CLASS);

  if (clickedOption.classList.contains(OBJECTION_COLOR)) {
    setConsent();
  } else if (clickedOption.classList.contains(CONSENT_COLOR)) {
    if (clickedOption.classList.contains(GLOBAL_OPTION_CLASS)) {
      setObjection();
    } else {
      setGlobal();
    }
  } else if (
    clickedOption.classList.contains(INHERITED_CONSENT_COLOR) ||
    clickedOption.classList.contains(INHERITED_OBJECTION_COLOR)
  ) {
    setObjection();
  }

  if (isGlobal) {
    const domainsChoices = document.getElementsByClassName(OPTION_CLASS);
    for (const choice of domainsChoices) {
      invertGlobal(choice);
    }
  }

  storeOptions(clickedOption.parentElement);

  function setConsent () {
    removeClasses();

    clickedOption.classList.add(CONSENT_COLOR);
    clickedOption.setAttribute(VALUE_ATTRIBUTE, CONSENT);
    clickedOption.title = getMessage('consent_extended');
  }

  function setObjection () {
    removeClasses();

    clickedOption.classList.add(OBJECTION_COLOR);
    clickedOption.setAttribute(VALUE_ATTRIBUTE, OBJECTION);
    clickedOption.title = getMessage('objection_extended');
  }

  function setGlobal () {
    removeClasses();

    const globalOption = document.getElementById(GLOBAL_OPTION_CLASS);
    if (globalOption.getAttribute(VALUE_ATTRIBUTE) === CONSENT.toString()) {
      clickedOption.classList.add(INHERITED_CONSENT_COLOR);
      clickedOption.title = getMessage('inherited_consent');
    } else {
      clickedOption.classList.add(INHERITED_OBJECTION_COLOR);
      clickedOption.title = getMessage('inherited_objection');
    }

    clickedOption.setAttribute(VALUE_ATTRIBUTE, INHERITED);
  }

  function invertGlobal (choice) {
    if (choice.classList.contains(INHERITED_CONSENT_COLOR)) {
      choice.classList.remove(INHERITED_CONSENT_COLOR);
      choice.classList.add(INHERITED_OBJECTION_COLOR);
      choice.title = getMessage('inherited_objection');
    } else if (choice.classList.contains(INHERITED_OBJECTION_COLOR)) {
      choice.classList.remove(INHERITED_OBJECTION_COLOR);
      choice.classList.add(INHERITED_CONSENT_COLOR);
      choice.title = getMessage('inherited_consent');
    }
  }

  function removeClasses () {
    clickedOption.classList.remove(CONSENT_COLOR);
    clickedOption.classList.remove(OBJECTION_COLOR);
    clickedOption.classList.remove(INHERITED_CONSENT_COLOR);
    clickedOption.classList.remove(INHERITED_OBJECTION_COLOR);
  }
}

function storeOptions (row) {

  let name;
  if (row.id === GLOBAL_ROW_ID) {
    name = GLOBAL_OPTIONS;
  } else {
    name = row.id;
  }

  const value = parseInt(row.lastElementChild.getAttribute(VALUE_ATTRIBUTE));

  browser.storage.sync.get(VENDOR_OPTIONS).then(
    result => {
      result[VENDOR_OPTIONS][name] = value;

      browser.storage.sync.set(result).catch(onError);
    }, onError);
}

function useGlobal () {
  browser.storage.sync.get(VENDOR_OPTIONS).then(
    result => {
      const vendors = result[VENDOR_OPTIONS];

      for (const [key] of Object.entries(vendors)) {
        if (key === GLOBAL_OPTIONS) {
          continue;
        }

        vendors[key] = INHERITED;
      }

      result[VENDOR_OPTIONS] = vendors;
      browser.storage.sync.set(result).catch(onError);
      restoreOptions();
    }, onError);
}