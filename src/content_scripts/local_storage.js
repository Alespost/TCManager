/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

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