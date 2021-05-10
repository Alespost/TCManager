/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

/**
 * Display localized content for purposes options page.
 */
function displayOptionsContent () {
  displayLayoutContent();
  displayButtons();
  displayListHeaders();
  displayActionsHeader();
}

/**
 * Display localized content for vendor options page.
 */
function displayVendorsOptionsContent () {
  displayLayoutContent();
  displayUseGlobalButton();
  document.getElementById('vendor_name_header').innerText = getMessage('vendor_name_header');
  document.getElementById('policy_link').innerText = getMessage('policy_link');
  document.getElementById('vendor_choice').innerText = getMessage('vendor_choice');
}

/**
 * Display localized content for purposes description page.
 */
function displayDescriptionContent () {
  displayLayoutContent();
  displayListHeaders();
  displayListItems('purpose');
  displayListItems('special_feature');
}

/**
 * Display localized content for about page.
 */
function displayAboutContent () {
  displayLayoutContent();
  document.getElementById('about_header').innerText = getMessage('about_header');
  document.getElementById('version').innerText =
    getMessage('version') + ': ' + browser.runtime.getManifest().version;

  document.getElementById('author_header').innerText = getMessage('author_header');
  document.getElementById('name').innerText = getMessage('name') + ':';
  document.getElementById('email').innerText = getMessage('email') + ':';
  document.getElementById('organization').innerText = getMessage('organization') + ':';
  document.getElementById('org_name').innerText = getMessage('org_name');
  document.getElementById('used_icons_header').innerText = getMessage('used_icons_header');
  document.getElementById('icons_taken_form').innerText = getMessage('icons_taken_from');
  document.getElementById('license').innerText = getMessage('license');
}

/**
 * Display content common to all option pages.
 */
function displayLayoutContent () {
  document.title = getMessage('options_title');
  displayOptionsHeader();
  displayNavItems();
}

/**
 * Display localized options header.
 */
function displayOptionsHeader () {
  document.getElementById('options_header').innerText = getMessage('options_header');
}

/**
 * Display localized navigation items.
 */
function displayNavItems () {
  document.getElementById('nav_options').innerText = getMessage('nav_options');
  document.getElementById('nav_description').innerText = getMessage('nav_description');
  document.getElementById('nav_vendors').innerText = getMessage('nav_options_vendor');
  document.getElementById('nav_about').innerText = getMessage('nav_about');
}

/**
 * Display localized text in buttons in purposes options page.
 */
function displayButtons () {
  displayResetButton();
  displayUseGlobalButton();
  displayRemoveDomainsButton();
}

function displayResetButton () {
  const reset = document.getElementById('reset');
  reset.innerText = getMessage('reset_to_defaults');
  reset.title = getMessage('reset_to_defaults_tooltip');
}

function displayUseGlobalButton () {
  const useGlobal = document.getElementById('use_global');
  useGlobal.innerText = getMessage('use_global_all');
  useGlobal.title = getMessage('use_global_all_tooltip');
}

function displayRemoveDomainsButton () {
  const removeDomains = document.getElementById('remove_domains');
  removeDomains.innerText = getMessage('remove_domains');
  removeDomains.title = getMessage('remove_domains_tooltip');
}

/**
 * Display localized headers Purposes and Special Features headers.
 */
function displayListHeaders () {
  document.getElementById('purposes_header').innerText = getMessage('purposes_header');
  document.getElementById('special_features_header').innerText = getMessage('special_features_header');
}

/**
 * Display localized text for global options
 */
function displayGlobalOptionsHeader () {
  document.getElementById('global_header').innerText = getMessage('options_global');
}

/**
 * Display localized header for Action column.
 */
function displayActionsHeader () {
  document.getElementById('actions_header').innerText = getMessage('actions_header');
}

/**
 * Display localized descriptions of purposes and special features.
 */
function displayListItems (listIdPrefix) {
  let count;
  switch (listIdPrefix) {
    case 'purpose':
      count = PURPOSES_COUNT;
      break;
    case 'special_feature':
      count = SPECIAL_FEATURES_COUNT;
      break;
    default:
      return;
  }

  const list = document.getElementById(listIdPrefix + '_list');
  for (let i = 1; i <= count; i++) {
    const item = document.createElement('li');
    item.classList.add('bold');
    item.innerText = getMessage(listIdPrefix + i);

    const description = document.createElement('ul');
    description.classList.add('description');

    const descriptionItem = document.createElement('li');
    descriptionItem.innerText = getMessage(listIdPrefix + i + '_description');

    description.appendChild(descriptionItem);
    item.appendChild(description);
    list.appendChild(item);
  }
}

