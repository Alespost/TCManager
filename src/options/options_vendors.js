document.addEventListener('DOMContentLoaded', (event) => {
  restoreOptions();
});

function restoreOptions () {
  browser.storage.sync.get(VENDOR_OPTIONS).then(setCurrentChoices, onError);

  function setCurrentChoices (result) {
    const vendorChoices = result[VENDOR_OPTIONS];
    console.log(vendorChoices);

    const table = document.getElementById('options_vendors_body');

    const row = createOptionsRow(vendorChoices[GLOBAL_OPTIONS]);

    // for (const [key, value] of Object.entries(vendorChoices)) {
    //   const row = createOptionsRow(value);
    //   table.appendChild(row);
    // }

    // displayContent();
  }

  function createOptionsRow (vendor) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.classList.add('row_header', 'left');

    if (vendor.id === null && vendor.name === GLOBAL_OPTIONS) {
      nameCell.id = 'global_header';
      nameCell.innerText = vendor.name //TODO remove
    } else {
      nameCell.innerText = vendor.name;
    }

    row.appendChild(nameCell);

    const idCell = document.createElement('td');
    idCell.classList.remove('row_header', 'left');
    idCell.innerText = vendor.id;

    row.appendChild(idCell);

    setChoices();
    return row;

    function setChoices () {
        const cell = document.createElement('td');
        const choiceClass = SPECIAL_FEATURE_CLASS_PREFIX;

        if (vendor.name === GLOBAL_OPTIONS) {
          cell.classList.add(GLOBAL_OPTION_CLASS);
          cell.id = choiceClass;
        } else {
          cell.classList.add(OPTION_CLASS);
        }

        cell.classList.add(choiceClass);
        cell.setAttribute(VALUE_ATTRIBUTE, vendor.choice);
        cell.addEventListener('click', optionClickedHandler);

        switch (vendor.choice) {
          case CONSENT:
            cell.classList.add(LOCAL_CONSENT_COLOR);
            cell.setAttribute(VALUE_ATTRIBUTE, CONSENT);
            break;
          case OBJECTION:
            cell.classList.add(LOCAL_OBJECTION_COLOR);
            cell.setAttribute(VALUE_ATTRIBUTE, OBJECTION);
            break;
/*          case GLOBAL_VALUE:
            if (global[type][key] === CONSENT) {
              cell.classList.add(GLOBAL_CONSENT_COLOR);
            } else {
              cell.classList.add(GLOBAL_OBJECTION_COLOR);
            }
            break;*/
        }

        row.appendChild(cell);
    }
  }

  function onError (error) {
    console.error(`Error: ${error}`);
  }
}

function optionClickedHandler (event) {
  const clickedOption = event.target;
  const id = clickedOption.getAttribute('id');

  if (clickedOption.classList.contains(LOCAL_OBJECTION_COLOR)) {
    setConsent();
  } else if (clickedOption.classList.contains(LOCAL_CONSENT_COLOR)) {
    if (clickedOption.classList.contains(GLOBAL_OPTION_CLASS)) {
      setObjection();
    } else {
      setGlobal();
    }
  } else if (
    clickedOption.classList.contains(GLOBAL_CONSENT_COLOR) ||
    clickedOption.classList.contains(GLOBAL_OBJECTION_COLOR)
  ) {
    setObjection();
  }

  if (id !== null) {
    const domainsChoices = document.getElementsByClassName(OPTION_CLASS + ' ' + id);
    for (const choice of domainsChoices) {
      invertGlobal(choice);
    }
  }

  storeOptions(clickedOption.parentElement);

  function setConsent () {
    removeClasses();

    clickedOption.classList.add(LOCAL_CONSENT_COLOR);
    clickedOption.setAttribute(VALUE_ATTRIBUTE, CONSENT);
  }

  function setObjection () {
    removeClasses();

    clickedOption.classList.add(LOCAL_OBJECTION_COLOR);
    clickedOption.setAttribute(VALUE_ATTRIBUTE, OBJECTION);
  }

  function setGlobal () {
    removeClasses();

    const choiceType = clickedOption.className.match(
      new RegExp('(' + PURPOSE_CLASS_PREFIX + '|' + SPECIAL_FEATURE_CLASS_PREFIX + ')[^\s]*'),
    )[0];

    const globalOption = document.getElementById(choiceType);
    if (globalOption.getAttribute(VALUE_ATTRIBUTE) === CONSENT.toString()) {
      clickedOption.classList.add(GLOBAL_CONSENT_COLOR);
    } else {
      clickedOption.classList.add(GLOBAL_OBJECTION_COLOR);
    }

    clickedOption.setAttribute(VALUE_ATTRIBUTE, GLOBAL_VALUE);
  }

  function invertGlobal (choice) {
    if (choice.classList.contains(GLOBAL_CONSENT_COLOR)) {
      choice.classList.remove(GLOBAL_CONSENT_COLOR);
      choice.classList.add(GLOBAL_OBJECTION_COLOR);
    } else if (choice.classList.contains(GLOBAL_OBJECTION_COLOR)) {
      choice.classList.remove(GLOBAL_OBJECTION_COLOR);
      choice.classList.add(GLOBAL_CONSENT_COLOR);
    }
  }

  function removeClasses () {
    clickedOption.classList.remove(LOCAL_CONSENT_COLOR);
    clickedOption.classList.remove(LOCAL_OBJECTION_COLOR);
    clickedOption.classList.remove(GLOBAL_CONSENT_COLOR);
    clickedOption.classList.remove(GLOBAL_OBJECTION_COLOR);
  }
}

function storeOptions (row) {
  let cell = row.firstElementChild;

  let name;
  if (row.id === GLOBAL_ROW_ID) {
    name = GLOBAL_OPTIONS;
  } else {
    name = cell.innerHTML;
  }

  cell = cell.nextElementSibling;

  let purposes = [];
  for (let i = 0; i < PURPOSES_COUNT; i++) {
    let value = false;

    if (cell.classList.contains(PURPOSE_CLASS_PREFIX + (i + 1))) {
      switch (cell.getAttribute(VALUE_ATTRIBUTE)) {
        case CONSENT.toString():
          value = CONSENT;
          break;
        case OBJECTION.toString():
          value = OBJECTION;
          break;
        case String(GLOBAL_VALUE):
          value = GLOBAL_VALUE;
          break;
      }
    }

    purposes.push(value);
    cell = cell.nextElementSibling;
  }

  let specialFeatures = [];
  for (let i = 0; i < SPECIAL_FEATURES_COUNT; i++) {
    let value = false;
    if (cell.classList.contains(SPECIAL_FEATURE_CLASS_PREFIX + (i + 1))) {
      switch (cell.getAttribute(VALUE_ATTRIBUTE)) {
        case CONSENT.toString():
          value = CONSENT;
          break;
        case OBJECTION.toString():
          value = OBJECTION;
          break;
        case String(GLOBAL_VALUE):
          value = GLOBAL_VALUE;
          break;
      }
    }

    specialFeatures.push(value);
    cell = cell.nextElementSibling;
  }

  const options = {};
  options[name] = {};
  options[name][PURPOSES_OPTIONS] = purposes;
  options[name][SPECIAL_FEATURES_OPTIONS] = specialFeatures;

  browser.storage.sync.set(options);
}