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


Publish Extension
-----------------

    commonjs -v --script publish ./


Testing
-------

Assuming: OSX

Testing (Firefox 3.6 & Firebug 1.7 & FirePHP 0.5.0):

    /Applications/Firefox\ 3.6/Firefox.app/Contents/MacOS/firefox-bin -no-remote -P firephp-extension-fb_1_7

Development (Firefox 5+ & Firebug 1.8):

    /Applications/Firefox.app/Contents/MacOS/firefox-bin -no-remote -P firephp-extension-fb_1_8

Development (Firefox 8+ & Firebug 1.9):

    /Applications/Firefox.app/Contents/MacOS/firefox-bin -no-remote -jsconsole -P firephp-extension-fb_1_9

Production/Testing (Firefox 5+ & amo):
    
    /Applications/Firefox.app/Contents/MacOS/firefox-bin -no-remote -P firephp-extension-amo

Production (Firefox 5+ & sourcemint):
    
    /Applications/Firefox.app/Contents/MacOS/firefox-bin -no-remote -P firephp-extension-sourcemint


Links
=====

  * http://reference.developercompanion.com/Tools/FirePHPCompanion/Run/Examples/
  * https://addons.mozilla.org/en-US/firefox/pages/appversions/

  
Dev Setup
=========

    ln -s /pinf/workspaces/github.com/firephp/firephp-extension/extension /Users/cadorn/Library/Application\ Support/Firefox/Profiles/8lfmz54q.firephp-extension-fb_1_9/extensions/FirePHPExtension-Build@firephp.org
    ln -s /pinf/workspaces/fbug.googlecode.com/svn/branches/firebug1.9 /Users/cadorn/Library/Application\ Support/Firefox/Profiles/8lfmz54q.firephp-extension-fb_1_9/extensions/firebug@software.joehewitt.com
    ln -s /pinf/workspaces/fbug.googlecode.com/svn/extensions/fbtrace/branches/fbtrace1.9 /Users/cadorn/Library/Application\ Support/Firefox/Profiles/8lfmz54q.firephp-extension-fb_1_9/extensions/fbtrace@getfirebug.com

**user.js**

    user_pref("javascript.options.showInConsole", true);
    user_pref("nglayout.debug.disable_xul_cache", true);
    user_pref("browser.dom.window.dump.enabled",  true);
    user_pref("javascript.options.strict", true);
    user_pref("extensions.logging.enabled", true);
    user_pref("browser.tabs.warnOnClose", false);
