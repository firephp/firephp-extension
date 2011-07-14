
Dev Commands
============

    pinf switch-workspace github.com/cadorn/firephp-extension

    pinf build-program .

    nr launch --dev --version 3.6 --profile master-1.5
    nr launch --dev --version 3.6 --profile master-1.6
    nr launch --dev --version 3.6 --profile master-1.7

    nr launch --dev --version 4.0b6 --profile master-1.6
    nr launch --dev --version 4.0b6 --profile master-1.7

    nr launch --dev --version 5.0 --profile master-1.8

Publishing:

    pinf build-program . dist
    git tag v...
    pinf build-program . upload



Profiles
--------

    nr create-profile --dev master-1.8
    nr add-extension -l --profile master-1.8 build/extension
    nr add-extension -l --profile master-1.8 /Users/cadorn/pinf/workspaces/fbug.googlecode.com/svn/branches/firebug1.8


Firebug
-------

1.4

    svn checkout http://fbug.googlecode.com/svn/branches/firebug1.4/ firebug1.4
    cd firebug-1.5
    ant dev-setup

1.5

    svn checkout http://fbug.googlecode.com/svn/branches/firebug1.5/ firebug1.5
    svn checkout http://fbug.googlecode.com/svn/jsdoc/ firebug-jsdoc
    cd firebug-1.5
    // echo 'jsdoc.dir=../firebug-jsdoc/' > local.properties
    // NOTE: The jsdoc.dir property is not loaded from local.properties before jsdoc tools are run
    // Need to remove jsdoc stuff from bottom of build.xml for now
    ant dev-setup

1.8

    svn checkout http://fbug.googlecode.com/svn/branches/firebug1.8/ firebug1.8
    cd firebug1.8
