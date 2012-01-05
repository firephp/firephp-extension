
2012-01-05 - Release Version: 0.7.0rc2

    - Page messages logging fix

2012-01-05 - Release Version: 0.7.0rc1

    - Firebug console stylesheet registration fix
    - (Issue 182)Group Collapsed drop FireBug error (removeClass() fix)

2011-12-08 - Release Version: 0.7.0b1

    - Set browser min version to `8.*`
    - Set browser max version to `10.*`
    - Set Firebug min version to `1.9`
    - (Issue 180) Complete refactoring into AMD modules
    - FBTrace based debugging
    - Enable on first load if Firebug enabled

2011-08-17 - Release Version: 0.6.2

    - Set browser version from `5.0` to `8.*`
    - (Issue 174) Erroneous Firebug version check gives warning and disabled FirePHP
    - Refactored project to use PINF to manage development workspace

2011-08-11 - Release Version: 0.6.1
2011-08-03 - Release Version: 0.6.0

    - Fixes for Firebug 1.8

2011-07-14 - Release Version: 0.5.0

    - Set max Firefox version to 7

2010-10-26 - Release Version: 0.5.0

2010-10-08 - Release Version: 0.5rc1

2010-10-08 - Release Version: 0.4.4rc3

    - Bugfix to ignore unknown protocol headers
    - (Issue 152) Enhancement: Support for Firefox 4 & Firebug 1.7 [18m]
    - Link for upgrade message if FirePHP 1.0 used on server
    - Send x-insight request header for FirePHP 1.0 compatibility

2010-07-19 - Release Version: 0.4.4rc2

    - (Issue 141) Advanced grouping bug
    - (Issue 57) Duplicate console output
    - (Issue 136) Firebug 1.5X.0 Final won't show FirePHP's console output on first run
    - (Issue 144) firebug 1.6X.0a10
    - Link to twitter in menu & notification on upgrade

2010-03-05 - Release Version: 0.4.4rc1

    - (Issue 135) FirePHP 0.4.3 with Firebug 1.5 changes user agent on the fly
    - (Issue 138) Redirect "dump" to "log" in extension
    - (Issue 137) Remove advertised support for Firefox 3.0 on FirePHP 0.4.x branch
    - Firebug 1.6+ compatibility
    - Firefox 3.5 and Firebug 1.5 required at minimum
    - Removed Server tab in Net panel requests
    - Firebug compatibility notifications
    - Notification to remind about enabling net panel
    - Option to not modify user-agent
    - Option to show variable viewer on click
    - Added FAQs link to menus
    - Removed "Allowed Sites"

2009-12-05 - Release Version: 0.4.3

    - Removed use of eval() which resulted in the removal of the custom request processor and renderer features

2009-11-17 - Release Version: 0.4.2

    - (Issue 124) FirePHP 0.3.1 not working with Firebug 1.4.2+
    - (Issue 126) FirePHP 0.3.1 does not work with Firebug 1.5a21

2009-06-13 - Release Version: 0.3.1

    - (Issue 110) No console logging in iceweasel 3.0.6 with firebug 1.3.3.

2009-05-11 - Release Version: 0.3
2009-05-01 - Release Version: 0.3.rc.1

    - (Issue 104) FirePHP doesn't play nice with User Agent Switcher
    - (Issue 80) Auto/Pre collapsing groups AND Custom group row colors
    - (Issue 94) Console not working with Firebug 1.4a13"

2009-02-12 - Release Version: 0.2.4

    - (Issue 88) FirePHP does not work with Firebug 1.4
    - (Issue 86) File and Line info does not show when firebug is running in window
    - Added donation menu item

2008-10-23 - Release Version: 0.2.1

    - Bugfix to allow data headers in any order
    - Added support for Firebug 1.3

2008-10-20 - Release Version: 0.2.0

    - Updated version to 0.2.0  
    - Skip X-Wf-1-Index header for now

2008-10-16 - Release Version: 0.2.b.4

    - (Issue 37) Display file and line information for each log message

2008-10-14 - Release Version: 0.2.b.3

    - Updated JsonStream wildfire protocol to be more robust
    - (Issue 47) Error in plugin - problem with large object graphs
    - Updated min requirement for FirePHPCore library to 0.2.0
    - Added style to notices in variable renderer

2008-10-07 - Release Version: 0.2.b.2

    - Added private/protected/public/undeclared/static visibility indicators to objects in variable viewer
    - (Issue 28) Need solution for logging private and protected object variables
    - (Issue 42) TRACE and EXCEPTION not working on windows servers
    - Bugfix in Wildfire JsonProtocol handler to allow Index message in any position

2008-10-01 - Release Version: 0.2.b.1

    - Added support for displaying ErrorExceptions raised by trigger_error()
    - (Issue 25) Wrong order in FireBug Console
    - Removed dependency on jQuery for Ajax requests
    - Added info message with link in console when server library is not latest available
    - Added detection and recording of server wildfire plugin version
    - Fix for Wildfire JsonStream to allow Wf-*-Index header to be sent in any position
    - Fix for TABLE logging style to allow table label in meta.label as well as data[0]
    - (Issue 31) Log messages with labels reproduced as Array(2) in firebug console
    - Added support for console groups
    - Added support for message labels when using the wildfire protocol
    - Added resizing links to variable viewer overlay and persist last size in preferences
    - (Issue 11) Variable inspection for arrays logged to console
    - (Issue 30) Allow explicit wrapping of logging data
    - Major work on new variable renderers for console
    - (Issue 16) Escape HTML in variable values
    - Capitalized FALSE, TRUE, NULL in variable renderer overlay
    - Changed variable renderer in overlay to use nested DIV's instead of whitespace for indentation
    - Updated link to discussion group/forum

2008-08-25 - Release Version: 0.1.2
2008-08-24 - Release Version: 0.1.1.2

    - (Issue 15) FirePHP does not display messages in the console with latest version of Firebug
    - (Issue 10) Prevent "not well-formed error" in JS console when loading processor and renderer
    - (Issue 14) Updated wildfire protocol to wrap header message values with "|"
    - Updated Net panel override to make it consistent with latest changes in fb 1.2

2008-07-31 - Release Version: 0.1.1.1
2008-07-31 - Release Version: 0.1.1

    - Nothing changed

2008-07-30 - Release Version: 0.1.0.8

    - Bugfix - CSS style not added when FirePHP first loads
    - Updated rendering of null, false and true in Variable Viewer

2008-07-30 - Release Version: 0.1.0.7

    - Display object class name if __className key found in data
    - Bugfix - Display null values properly in variable inspector
    - Bugfix - Show dumped variables in "Server" request tab if using wildfire
    - Bugfix - FF3 - Messages not showing in console when Firebug is detached
    - Bugfix - Fix loading of custom processors and renderers

2008-07-23 - Release Version: 0.1.0.5

    - Updated plugin URI for FirePHP Wildfire plugin

2008-07-22 - Release Version: 0.1.0.4

    - Bugfix - Gray background for variable viewer on windows
    - Added icon for FirePHP Headquarters link in FirePHP menu and updated style
    - Bugfix - Trace and exception logging broke when function/method argument was "false" or "null"

2008-07-17 - Release Version: 0.1.0.3

    - Minor bugfix in request processor
    - Added support for the wildfire JsonStream protocol to communicate with the Zend Framework component

2008-07-13 - Release Version: 0.1.0.2

    - Added X-FirePHP-Agent request header when visiting FirePHP related sites
    - Launch Welcome page once every time FirePHP is upgraded
    - Added link to welcome page in menus
    - Added links to important sites to menu
    - Added ability to enable and disable FirePHP from menu
    - Added FirePHP menu next to Firebug menu in Firebug UI
    - Updated FirePHP::TABLE to use new variable viewer for array/object values
    - Added variable viewer overlay
    - Bugfix - FF3 - Logging of events when Firebug is running in its own window
    - Bugfix - Improved custom stylesheet inclusion
    - FF3 - Updated request monitoring to use Firebug onLoad listener
    - Updated logo

2008-06-16 - Release Version: 0.1.0.1

    - Added support for FirePHP::TRACE log style
    - Updated background and font for FirePHP request group titles

2008-06-13 - Release Version: 0.1.0

    - Cleaned up code a bit
    - Removed debug print statements
    - Updated Firefox support version to 3.0.*
    - Updated license of the extension to the new BSD license

2008-06-07 - Release Version: 0.0.6.23

    - Bugfix - Moved jQuery to a namespace under FirePHPLib to avoid namespace conflicts with other extensions

2008-06-06 - Release Version: 0.0.6.22

    - Bugfix - FF2 - Only send FirePHP user-agent header when Firebug is enabled
    - Bugfix - FF3 - Only send FirePHP user-agent header when Firebug Net Panel is enabled
    - Added support for FirePHP::TABLE log style

2008-05-28 - Release Version: 0.0.6.20

    - Bugfix - FF3 - Call request processor on main page load
    - Bugfix - Display of POST parameters in Post tab of request inspector
    - Bugfix - Display of POST response in Response tab of request inspector
    - Bugfix - Escape all HTML chracters rendered in Server tab of request inspector

2008-05-15 - Release Version: 0.0.6.19

    - Bugfix - Expanding requests for Firebug 1.2

2008-05-15 - Release Version: 0.0.6.18

    - Added support for Firebug 1.2

2008-05-15 - Release Version: 0.0.6.17

    - Bugfix - Ensure custom log templates and stylesheets are added correctly at all times

2008-05-14 - Release Version: 0.0.6.16

    - Bugfix - Monitor page loading and trigger request processor for main page and iframes
    - Changed API of Request processor to receive URL and Data as method arguments
    - Bugfix - Display correct URL for console message groups

2008-05-09 - Release Version: 0.0.6.15
	
    - Updated default processor to render exception stacks without wrapping the filenames
    - Added updateKey to install.rdf
    - Updated browser version to support FF3
    - Removed component used to add to User-Agent request header as we can do this directly via httpChannel
    - Removed ?t=xxx from custom processor URL's

2008-04-16 - Release Version: 0.0.6.14
	
    - Bugfix - Re-initialize processor when console panel is not found
    - Bugfix - Add custom stylesheet to console panel on showPanel()

2008-04-16 - Release Version: 0.0.6.10

    - Added feature to allow custom processors to define their own logging templates
    - Moved trace logging template into default processor

2008-04-13 - Release Version: 0.0.6.9

    - Implemented full PHP stack trace logging with variable inspection for fb.php

2008-04-12 - Release Version: 0.0.6.8

    - Bugfix - Parsing of header data in old format
    - Bugfix - Adding and removing of FirePHP/X.X.X in User-Agent request header

2008-04-11 - Release Version: 0.0.6.7

    - New FirePHP client in form of jQuery plugin to be used in Jaxer server environment
    - Bugfix - Console logging with different tabs and windows open and detached firebug window
    - Updated custom code loading verification to allow different hosts for renderer and processor URL's

2008-04-09 - Release Version: 0.0.6.6

    - Enabled loading of custom renderers and processors from third part hosts if explicitly allowed by user

2008-04-09 - Release Version: 0.0.6.5

    - Bugfix for Firebug version 1.05

2008-04-09 - Release Version: 0.0.6.4

    - Updated security model to allow default renderer and processor without explicit action by user
    - Change json data parsing from eval() to json_parse()
    - Misc bug fixes to improve reliability
    - Updated default renderer for server tab
    - Updated data parsing and default renderer and processor to work with new fb() PHP function
    - Implemented sorting of data headers based on numeric index
    - The default processor will now fail gracefully if there is a problem logging the data
    - The log mode string for console messages in the default processor is now case-insensitive

2008-04-07 - Release Version: 0.0.6.3

    - Implemented request processor that is called for every request in the background
    - Renamed headers to start with X-...
    - Added support for Firebug 1.1 (based on 1.1.0b12)	
    - Added current FirePHP version and OS info to update URL

2007-12-07 - Release Version: 0.0.5.26

    - Finished full jQuery support for renderer
    - Bugfix to make FirePHP work when Firebug is detached in its own window

2007-12-05 - Release Version: 0.0.5.24

    - Fixed incompatibility with HTML Validator extension: http://users.skynet.be/mgueury/mozilla/
    - Fixed unique renderer key to allow request scoping in generated HTML for Console and Net panels
    - Bugfix to make FirePHP work in Console panel with Ajax requests

2007-12-04 - Release Version: 0.0.5.23

    - Implemented explicit enable for each host and allowed sites menu & dialog
    - Only send FirePHP accept and user agent headers when firebug is enabled
    - Changed header name from FirePHP-Mask to FirePHP-RendererURL
    - Added support for javascript in the rendered HTML

2007-11-26 - Release Version: 0.0.5.22

    - Updated to ignore case of header names
    - Implemented data rendering in Server tab where data is fetched from response headers
    - Added "Server" tab to Firebug's Net panel requests
    - Abandoned previous idea in favor of simplicity
	
---------- REBOOT ----------

    - Changed PINF-org.firephp-* headers to X-PINF-org.firephp-*
    - Updated UI design
    - Added variable inspector and viewer
    - Added console viewer
    - Added support for platform-specific CSS and added Mac look
    - Introduced versioning for the FirePHP XML protocol and set to 0.2
    - Added a FirePHPChannel object to the content windows that can be
      used to communicate with/via FirePHP
    - Added event/listener based communication of all components via FirePHPChannel
    - Revised format of capabilities definition
    - Revised how capability definitions are loaded
    - Added support to allow and block capability definition loading for hosts
    - Implemented support for build version
    - Added FirePHP/x.x.x to User-Agent Request header
    - Implemented fetching of intelligence data from X-PINF-org.firephp-Data header
    - Fixed bug to display application ID if label is not found
    - Fixed variable list loading
    - Fixed variable selection and display
    - Implemented basic javascript array renderer
    - Implemented SESSION variables list
  
2007-02-02 - Release Version: 0.0.5

    - Wrapped add progress listener into try/catch to prevent some console warnings
    - Removed debug dump statements

2007-02-01 - Release Version: 0.0.4

    - New code structure
    - Lots of feature enhancements

2007-01-12 - Release Version: 0.0.3

    - Set defaultPanelName preference to "console" if set to
      "FirePHP" to prevent Firebug from failing silently when
      extension is removed and "FirePHP" panel is still selected.
      Thanks to Matthieu Honel for the suggestion.
      A patch has been submitted to Firebug.
    - Added updateURL to install.rdf

2007-01-11
	
    - Added a sidebar and button to toggle sidebar.
      The sidebar currently contains one listbox that lists all
      events fired by Firebug as they occur. This will help
      during development to establish a clean order of events.
