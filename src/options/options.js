/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

document.addEventListener('DOMContentLoaded', (event) => {
  displayOptionsContent();
  restoreOptions();
  document.getElementById('reset').addEventListener('click', resetToDefaults);
  document.getElementById('use_global').addEventListener('click', useGlobal);
  document.getElementById('remove_domains').addEventListener('click', removeDomains);
});

/**
 * Load options from storage and display into the table.
 */
function restoreOptions () {
  browser.storage.sync.get().then(setCurrentChoices, onError);

  function setCurrentChoices (result) {
    const global = result[GLOBAL_OPTIONS];
    delete result[GLOBAL_OPTIONS];
    delete result[VENDOR_OPTIONS];

    const table = document.getElementById('options_body');
    table.innerHTML = ''; // Clear options table

    // Display row with global options
    const row = createOptionsRow(GLOBAL_OPTIONS, global);
    table.appendChild(row);
    displayGlobalOptionsHeader();

    // Sort domains alphabetically so that they are always displayed in the same order.
    const sorted = Object.entries(result).sort((a, b) => {
      if (a[0] > b[0])
        return 1;
      else if (a[0] < b[0])
        return -1;
      else
        return 0;
    });

    // Display options for all domains
    for (const [domain, choices] of sorted) {
      const row = createOptionsRow(domain, choices, global);
      table.appendChild(row);
    }
  }

  /**
   * Create table row for given domain and choices.
   */
  function createOptionsRow (domain, choices, global = null) {
    const row = document.createElement('tr');
    if (domain === GLOBAL_OPTIONS) {
      row.id = GLOBAL_ROW_ID;
    }

    // Row header - domain name
    const cell = document.createElement('td');
    cell.classList.add('row_header', 'left');

    if (domain === GLOBAL_OPTIONS) {
      cell.id = 'global_header';
    } else {
      cell.innerText = domain;
    }

    row.appendChild(cell);

    setChoices(PURPOSES_OPTIONS);
    setChoices(SPECIAL_FEATURES_OPTIONS);


    // Cell with action buttons
    const actions = document.createElement('td');
    actions.classList.add('center');

    const reset = document.createElement('button');
    reset.classList.add('action', 'reset');
    reset.title = getMessage('use_global_domain_tooltip');

    reset.setAttribute(VALUE_ATTRIBUTE, domain);
    reset.addEventListener('click', resetDomain);
    actions.appendChild(reset);

    if (domain !== GLOBAL_OPTIONS) {
      const remove = document.createElement('button');
      remove.classList.add('action', 'remove');
      remove.title = getMessage('remove_domain_tooltip');

      remove.setAttribute(VALUE_ATTRIBUTE, domain);
      remove.addEventListener('click', removeDomain);
      actions.appendChild(remove);
    }

    row.appendChild(actions);

    return row;

    /**
     * Create table cells with choices for individual purposes/special features.
     */
    function setChoices (type) {
      for (const [key, choice] of choices[type].entries()) {
        const number = key + 1;
        const cell = document.createElement('td');
        const choiceClass = (type === PURPOSES_OPTIONS ? PURPOSE_CLASS_PREFIX : SPECIAL_FEATURE_CLASS_PREFIX) + number;

        if (domain === GLOBAL_OPTIONS) {
          cell.classList.add(GLOBAL_OPTION_CLASS);
          cell.innerText = number;
          cell.id = choiceClass;
        } else {
          cell.classList.add(OPTION_CLASS);
        }

        let prefix;
        if (type === PURPOSES_OPTIONS) {
          prefix = 'purpose';
        } else {
          prefix = 'special_feature';
        }

        cell.title = getMessage(prefix + number) + ': ';
        cell.classList.add(choiceClass);
        cell.setAttribute(VALUE_ATTRIBUTE, choice);
        cell.addEventListener('click', optionClickedListener);

        switch (choice) {
          case CONSENT:
            cell.classList.add(CONSENT_COLOR);
            cell.setAttribute(VALUE_ATTRIBUTE, CONSENT);
            cell.title += getMessage('consent_extended');
            break;
          case OBJECTION:
            cell.classList.add(OBJECTION_COLOR);
            cell.setAttribute(VALUE_ATTRIBUTE, OBJECTION);
            cell.title += getMessage('objection_extended');
            break;
          case INHERITED:
            if (global[type][key] === CONSENT) {
              cell.classList.add(INHERITED_CONSENT_COLOR);
              cell.title += getMessage('inherited_consent');
            } else {
              cell.classList.add(INHERITED_OBJECTION_COLOR);
              cell.title += getMessage('inherited_objection');
            }
            break;
        }

        row.appendChild(cell);
      }
    }
  }
}

function optionClickedListener (event) {
  const clickedOption = event.target;
  const id = clickedOption.getAttribute('id');

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

  if (id !== null) {
    const domainsChoices = document.getElementsByClassName(OPTION_CLASS + ' ' + id);
    for (const choice of domainsChoices) {
      invertGlobal(choice);
    }
  }

  storeOptions(clickedOption.parentElement);

  function setConsent () {
    removeClasses();

    clickedOption.classList.add(CONSENT_COLOR);
    clickedOption.setAttribute(VALUE_ATTRIBUTE, CONSENT);
    clickedOption.title = clickedOption.title.split(':')[0] + ': ' + getMessage('consent_extended');
  }

  function setObjection () {
    removeClasses();

    clickedOption.classList.add(OBJECTION_COLOR);
    clickedOption.setAttribute(VALUE_ATTRIBUTE, OBJECTION);
    clickedOption.title = clickedOption.title.split(':')[0] + ': ' + getMessage('objection_extended');
  }

  function setGlobal () {
    removeClasses();

    const choiceType = clickedOption.className.match(
      new RegExp('(' + PURPOSE_CLASS_PREFIX + '|' + SPECIAL_FEATURE_CLASS_PREFIX + ')[^\s]*'),
    )[0];

    const globalOption = document.getElementById(choiceType);
    if (globalOption.getAttribute(VALUE_ATTRIBUTE) === CONSENT.toString()) {
      clickedOption.classList.add(INHERITED_CONSENT_COLOR);
      clickedOption.title = clickedOption.title.split(':')[0] + ': ' + getMessage('inherited_consent');
    } else {
      clickedOption.classList.add(INHERITED_OBJECTION_COLOR);
      clickedOption.title = clickedOption.title.split(':')[0] + ': ' + getMessage('inherited_objection');
    }

    clickedOption.setAttribute(VALUE_ATTRIBUTE, INHERITED);
  }

  function invertGlobal (choice) {
    if (choice.classList.contains(INHERITED_CONSENT_COLOR)) {
      choice.classList.remove(INHERITED_CONSENT_COLOR);
      choice.classList.add(INHERITED_OBJECTION_COLOR);
      choice.title = choice.title.split(':')[0] + ': ' + getMessage('inherited_objection');
    } else if (choice.classList.contains(INHERITED_OBJECTION_COLOR)) {
      choice.classList.remove(INHERITED_OBJECTION_COLOR);
      choice.classList.add(INHERITED_CONSENT_COLOR);
      choice.title = choice.title.split(':')[0] + ': ' + getMessage('inherited_consent');
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
        case String(INHERITED):
          value = INHERITED;
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
        case String(INHERITED):
          value = INHERITED;
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

  browser.storage.sync.set(options).catch(onError);
}

/**
 * Set all global options to OBJECTION.
 * Set domain options to INHERITED.
 */
function resetToDefaults () {
  browser.storage.sync.get().then(
    result => {
      delete result[VENDOR_OPTIONS];

      for (const [key, value] of Object.entries(result)) {
        if (key === GLOBAL_OPTIONS) {
          value[PURPOSES_OPTIONS].fill(OBJECTION);
          value[SPECIAL_FEATURES_OPTIONS].fill(OBJECTION);
        } else {
          value[PURPOSES_OPTIONS].fill(INHERITED);
          value[SPECIAL_FEATURES_OPTIONS].fill(INHERITED);
        }
      }

      browser.storage.sync.set(result).then(restoreOptions, onError);
    }, onError);
}

/**
 * Options for all domains are set to INHERITED value.
 */
function useGlobal () {
  browser.storage.sync.get().then(
    result => {
      delete result[GLOBAL_OPTIONS];
      delete result[VENDOR_OPTIONS];

      for (const [, value] of Object.entries(result)) {
        value[PURPOSES_OPTIONS].fill(INHERITED);
        value[SPECIAL_FEATURES_OPTIONS].fill(INHERITED);
      }

      browser.storage.sync.set(result).then(restoreOptions);
    }, onError);
}

/**
 * Remove options for all domains (except global options).
 */
function removeDomains () {
  browser.storage.sync.get().then(
    result => {
      delete result[GLOBAL_OPTIONS];
      delete result[VENDOR_OPTIONS];

      const domains = Object.keys(result);

      browser.storage.sync.remove(domains).then(restoreOptions);
    }, onError);
}

/**
 * Reset domain options to default.
 * Domain options are set to INHERITED value.
 * Global options are set to OBJECTION value.
 */
function resetDomain (e) {
  const domain = e.currentTarget.getAttribute(VALUE_ATTRIBUTE);

  browser.storage.sync.get(domain).then(
    result => {
      delete result[VENDOR_OPTIONS];

      if (domain === GLOBAL_OPTIONS) {
        result[domain][PURPOSES_OPTIONS].fill(OBJECTION);
        result[domain][SPECIAL_FEATURES_OPTIONS].fill(OBJECTION);
      } else {
        result[domain][PURPOSES_OPTIONS].fill(INHERITED);
        result[domain][SPECIAL_FEATURES_OPTIONS].fill(INHERITED);
      }

      browser.storage.sync.set(result).then(restoreOptions);
    }, onError);
}

/**
 * Remove options for specific domain.
 */
function removeDomain (e) {
  const domain = e.currentTarget.getAttribute(VALUE_ATTRIBUTE);

  if (domain !== GLOBAL_OPTIONS) {
    browser.storage.sync.remove(domain).then(restoreOptions, onError);
  }
}