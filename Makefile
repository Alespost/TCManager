all: mozilla

mozilla:
	cd src && zip -r ../tcmanager.zip * -x package*.json