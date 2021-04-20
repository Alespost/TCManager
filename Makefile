EXCLUDE=-x package*.json chrome/\* firefox/\*

all: firefox-pack chrome-pack clean

dependencies:
	cd src && npm install

firefox: dependencies
	cd src && cp -f firefox/manifest.json .

chrome: dependencies
	cd src && cp -f chrome/manifest.json .

firefox-pack: firefox
	cd src && zip -r ../tcmanager-firefox.zip * ${EXCLUDE}

chrome-pack: chrome
	cd src && zip -r ../tcmanager-chrome.zip * ${EXCLUDE}

clean:
	cd src && rm -rf manifest.json node_modules