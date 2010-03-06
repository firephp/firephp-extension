
Dev Commands
============

Publishing:

    pinf build-program . dist
    pinf build-program . upload


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
