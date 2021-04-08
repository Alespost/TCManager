all: mozilla chrome

mozilla:
	cd src && zip -r ../tcmanager-mozilla.zip * -x package*.json

chrome:
	cd src && zip -r ../tcmanager-chrome.zip * -x package*.json