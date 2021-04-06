function displayOptionsContent () {
  displayLayoutContent();
  displayButtons();
  displayListHeaders();
  displayGlobalOptionsHeader();
  displayActionsHeader();
}

function displayDescriptionContent() {
  displayLayoutContent();
  displayListHeaders();
  displayListItems('purpose');
  displayListItems('special_feature');
}

function displayAboutContent() {
  displayLayoutContent();
  document.getElementById('about_header').innerText = localizedMessage('about_header');
  document.getElementById('about').innerText = localizedMessage('about');
  document.getElementById('author_header').innerText = localizedMessage('author_header');
  document.getElementById('name').innerText = localizedMessage('name') + ':';
  document.getElementById('email').innerText = localizedMessage('email') + ':';
  document.getElementById('organization').innerText = localizedMessage('organization') + ':';
  document.getElementById('org_name').innerText = localizedMessage('org_name');
  document.getElementById('used_icons_header').innerText = localizedMessage('used_icons_header');
  document.getElementById('icons_taken_form').innerText = localizedMessage('icons_taken_from');
  document.getElementById('license').innerText = localizedMessage('license');
}

function displayLayoutContent() {
  document.title = localizedMessage('options_title');
  displayOptionsHeader();
  displayNavItems();
}

function displayOptionsHeader () {
  document.getElementById('options_header').innerText = localizedMessage('options_header');
}

function displayNavItems() {
  document.getElementById('nav_options').innerText = localizedMessage('nav_options');
  document.getElementById('nav_description').innerText = localizedMessage('nav_description');
  document.getElementById('nav_about').innerText = localizedMessage('nav_about');
}

function displayButtons() {
  const reset = document.getElementById('reset');
  reset.innerText = localizedMessage('reset_to_defaults');
  reset.title = localizedMessage('reset_to_defaults_tooltip');

  const useGlobal = document.getElementById('use_global');
  useGlobal.innerText = localizedMessage('use_global_all');
  useGlobal.title = localizedMessage('use_global_all_tooltip');

  const removeDomains = document.getElementById('remove_domains');
  removeDomains.innerText = localizedMessage('remove_domains');
  removeDomains.title = localizedMessage('remove_domains_tooltip');
}

function displayListHeaders () {
  document.getElementById('purposes_header').innerText = localizedMessage('purposes_header');
  document.getElementById('special_features_header').innerText = localizedMessage('special_features_header');
}

function displayGlobalOptionsHeader() {
  document.getElementById('global_header').innerText = localizedMessage('options_global');
}

function displayActionsHeader() {
  document.getElementById('actions_header').innerText = localizedMessage('actions_header');
}

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
    item.innerText = localizedMessage(listIdPrefix + i);

    const description = document.createElement('ul');
    description.classList.add('description');

    const descriptionItem = document.createElement('li');
    descriptionItem.innerText = localizedMessage(listIdPrefix + i + '_description');

    description.appendChild(descriptionItem);
    item.appendChild(description);
    list.appendChild(item);
  }
}

