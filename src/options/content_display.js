function displayOptionsContent () {
  document.title = localizedMessage('options_title');
  displayOptionsHeader();
  displayNavItems();
  displayListHeaders();
  displayGlobalOptionsHeader();
}

function displayDescriptionContent() {
  document.title = localizedMessage('options_title');
  displayOptionsHeader()
  displayNavItems();
  displayListHeaders();
  displayListItems('purpose');
  displayListItems('special_feature');
}



function displayOptionsHeader () {
  document.getElementById('options_header').innerText = localizedMessage('options_header');
}

function displayNavItems() {
  document.getElementById('nav_options').innerText = localizedMessage('nav_options');
  document.getElementById('nav_description').innerText = localizedMessage('nav_description');
  document.getElementById('nav_about').innerText = localizedMessage('nav_about');
}

function displayListHeaders () {
  document.getElementById('purposes_header').innerText = localizedMessage('purposes_header');
  document.getElementById('special_features_header').innerText = localizedMessage('special_features_header');
}

function displayGlobalOptionsHeader() {
  document.getElementById('global_header').innerText = localizedMessage('options_global');
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