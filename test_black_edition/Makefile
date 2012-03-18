PACKAGE = Node.js Black Edition
NODEJS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)

test:
	cd winston; vows --spec --isolate; cd ..
	nodeunit async/test/
	node wordwrap/test/*
	expresso traverse/test/*
	expresso optimist/test/*
