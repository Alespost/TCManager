all:

dependencies:
	cd src && npm install

firefox: dependencies
	cd src && cp -rf mozilla/manifest.json .

chrome: dependencies
	cd src && cp -rf chrome/manifest.json .

firefox-pack: firefox
	cd src && zip -r ../tcmanager-mozilla.zip * -x package*.json

chrome-pack: chrome
	cd src && zip -r ../tcmanager-chrome.zip * -x package*.json

clean:
	cd src && rm -rf manifest.json node_modules