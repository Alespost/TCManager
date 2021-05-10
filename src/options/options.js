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

function restoreOptions () {
  browser.storage.sync.get().then(setCurrentChoices, onError);

  function setCurrentChoices (result) {
    const global = result[GLOBAL_OPTIONS];
    delete result[GLOBAL_OPTIONS];
    delete result[VENDOR_OPTIONS];

    const table = document.getElementById('options_body');
    table.innerHTML = '';
    const row = createOptionsRow(GLOBAL_OPTIONS, global);
    table.appendChild(row);
    displayGlobalOptionsHeader();

    const sorted = Object.entries(result).sort((a, b) => {
      if (a[0] > b[0])
        return 1;
      else if (a[0] < b[0])
        return -1;
      else
        return 0;
    });

    for (const [domain, choices] of sorted) {
      const row = createOptionsRow(domain, choices, global);
      table.appendChild(row);
    }
  }

  function createOptionsRow (domain, choices, global = null) {
    const row = document.createElement('tr');
    if (domain === GLOBAL_OPTIONS) {
      row.id = GLOBAL_ROW_ID;
    }

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
            cell.classList.add(LOCAL_CONSENT_COLOR);
            cell.setAttribute(VALUE_ATTRIBUTE, CONSENT);
            cell.title += getMessage('consent_extended');
            break;
          case OBJECTION:
            cell.classList.add(LOCAL_OBJECTION_COLOR);
            cell.setAttribute(VALUE_ATTRIBUTE, OBJECTION);
            cell.title += getMessage('objection_extended');
            break;
          case INHERITED_VALUE:
            if (global[type][key] === CONSENT) {
              cell.classList.add(GLOBAL_CONSENT_COLOR);
              cell.title += getMessage('inherited_consent');
            } else {
              cell.classList.add(GLOBAL_OBJECTION_COLOR);
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
    clickedOption.title = clickedOption.title.split(':')[0] + ': ' + getMessage('consent_extended');
  }

  function setObjection () {
    removeClasses();

    clickedOption.classList.add(LOCAL_OBJECTION_COLOR);
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
      clickedOption.classList.add(GLOBAL_CONSENT_COLOR);
      clickedOption.title = clickedOption.title.split(':')[0] + ': ' + getMessage('inherited_consent');
    } else {
      clickedOption.classList.add(GLOBAL_OBJECTION_COLOR);
      clickedOption.title = clickedOption.title.split(':')[0] + ': ' + getMessage('inherited_objection');
    }

    clickedOption.setAttribute(VALUE_ATTRIBUTE, INHERITED_VALUE);
  }

  function invertGlobal (choice) {
    if (choice.classList.contains(GLOBAL_CONSENT_COLOR)) {
      choice.classList.remove(GLOBAL_CONSENT_COLOR);
      choice.classList.add(GLOBAL_OBJECTION_COLOR);
      choice.title = choice.title.split(':')[0] + ': ' + getMessage('inherited_objection');
    } else if (choice.classList.contains(GLOBAL_OBJECTION_COLOR)) {
      choice.classList.remove(GLOBAL_OBJECTION_COLOR);
      choice.classList.add(GLOBAL_CONSENT_COLOR);
      choice.title = choice.title.split(':')[0] + ': ' + getMessage('inherited_consent');
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
        case String(INHERITED_VALUE):
          value = INHERITED_VALUE;
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
        case String(INHERITED_VALUE):
          value = INHERITED_VALUE;
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

function resetToDefaults () {
  browser.storage.sync.get().then(
    result => {
      delete result[VENDOR_OPTIONS];

      for (const [key, value] of Object.entries(result)) {
        if (key === GLOBAL_OPTIONS) {
          value[PURPOSES_OPTIONS].fill(OBJECTION);
          value[SPECIAL_FEATURES_OPTIONS].fill(OBJECTION);
        } else {
          value[PURPOSES_OPTIONS].fill(INHERITED_VALUE);
          value[SPECIAL_FEATURES_OPTIONS].fill(INHERITED_VALUE);
        }
      }

      browser.storage.sync.set(result).then(restoreOptions, onError);
    }, onError);
}

function useGlobal () {
  browser.storage.sync.get().then(
    result => {
      delete result[GLOBAL_OPTIONS];
      delete result[VENDOR_OPTIONS];

      for (const [, value] of Object.entries(result)) {
        value[PURPOSES_OPTIONS].fill(INHERITED_VALUE);
        value[SPECIAL_FEATURES_OPTIONS].fill(INHERITED_VALUE);
      }

      browser.storage.sync.set(result).then(restoreOptions);
    }, onError);
}

function removeDomains () {
  browser.storage.sync.get().then(
    result => {
      delete result[GLOBAL_OPTIONS];
      delete result[VENDOR_OPTIONS];

      const domains = Object.keys(result);

      browser.storage.sync.remove(domains).then(restoreOptions);
    }, onError);
}

function resetDomain (e) {
  const domain = e.currentTarget.getAttribute(VALUE_ATTRIBUTE);

  browser.storage.sync.get(domain).then(
    result => {
      delete result[VENDOR_OPTIONS];

      if (domain === GLOBAL_OPTIONS) {
        result[domain][PURPOSES_OPTIONS].fill(OBJECTION);
        result[domain][SPECIAL_FEATURES_OPTIONS].fill(OBJECTION);
      } else {
        result[domain][PURPOSES_OPTIONS].fill(INHERITED_VALUE);
        result[domain][SPECIAL_FEATURES_OPTIONS].fill(INHERITED_VALUE);
      }

      browser.storage.sync.set(result).then(restoreOptions);
    }, onError);
}

function removeDomain (e) {
  const domain = e.currentTarget.getAttribute(VALUE_ATTRIBUTE);

  if (domain !== GLOBAL_OPTIONS) {
    browser.storage.sync.remove(domain).then(restoreOptions, onError);
  }
}