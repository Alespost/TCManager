function getLocalStorageItems(callback)
{
  const event = 'StorageItemsLoaded';

  const code =
    'const items = {};\n' +
    'for(var i =0; i < localStorage.length; i++){\n' +
    '  const key = localStorage.key(i); \n' +
    '  items[key] = localStorage.getItem(key);\n' +
    '}\n' +
    `document.dispatchEvent(new CustomEvent(\'${event}\', {\n` +
    '  detail: {items: items}\n' +
    '}));\n';

  document.addEventListener(event, eventListener);
  inject(code);

  function eventListener (e) {
    document.removeEventListener(event, eventListener);
    callback(e.detail.items);
  }
}

function updateItems(items) {
  // console.log(items);
  const code = `localStorage.setItem(\'test\', \'updated value\')`;
  inject(code);

  for (const [key, value] of Object.entries(items)) {
    const code = `localStorage.setItem(\'${key}\', ${JSON.stringify(value)})`;
    inject(code);
  }
}

function inject(code)
{
  const parent = document.documentElement;

  const script = document.createElement('script');


  script.async = false;
  script.text = code;

  parent.insertBefore(script, parent.firstChild);
  // parent.removeChild(script);
}