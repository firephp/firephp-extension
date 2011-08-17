PINF Workspace
==============

This directory contains everything needed to maintain this project using the
[PINF toolchain system](http://www.christophdorn.com/Research/#pinf).

To use *PINF* you must have the [PINF JavaScript Loader](https://github.com/pinf/loader-js) 
[installed](https://github.com/pinf/loader-js/blob/master/docs/Setup.md).

INFO: *PINF* currently works only on *UNIX* systems that support [node.js](http://nodejs.org/).


Commands
========

Build Extension
---------------

    commonjs -v --script build ./


Testing
-------

OSX:

    /Applications/Firefox.app/Contents/MacOS/firefox-bin -no-remote -P firephp-extension-fb_1_8
