
Dev Commands
============

Setup:

    tusk package install nr-devtools
    nr add-bin /Applications/Firefox.app/Contents/MacOS/firefox-bin
    nr create-profile --dev dev
    phing -f extension/build.xml build
    nr add-extension -l --profile dev build/extension

Running:

    phing -f extension/build.xml build
    nr launch --dev --app firefox --profile dev


Firebug
-------

1.4

    svn checkout http://fbug.googlecode.com/svn/branches/firebug1.4/ firebug-1.4
    cd firebug-1.5
    ant dev-setup

1.5

    svn checkout http://fbug.googlecode.com/svn/branches/firebug1.5/ firebug-1.5
    svn checkout http://fbug.googlecode.com/svn/jsdoc/ firebug-jsdoc
    cd firebug-1.5
    // echo 'jsdoc.dir=../firebug-jsdoc/' > local.properties
    // NOTE: The jsdoc.dir property is not loaded from local.properties before jsdoc tools are run
    // Need to remove jsdoc stuff from bottom of build.xml for now
    ant dev-setup
