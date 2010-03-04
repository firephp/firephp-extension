
0.x FirePHP Extension
=====================

This is the code for the FirePHP Firefox Extension currently live at [http://www.firephp.org/](http://www.firephp.org/).

A new version of FirePHP (1.0) now known as FireConsole is under development at: http://www.fireconsole.org/Alpha/

Mailing List
------------

http://groups.google.com/group/firephp-dev


Bug Reports
-----------

In the past FirePHP issues have been reported at: http://code.google.com/p/firephp/issues/list

The project has moved from GoogleCode to github. Please report new issues to:

Extension Issues: [http://github.com/cadorn/firephp-extension/issues](http://github.com/cadorn/firephp-extension/issues)

FirePHPCore Server Library Issues: [http://github.com/cadorn/firephp-libs/issues](http://github.com/cadorn/firephp-libs/issues)


Feature Requests
----------------

For discussion please post to: [http://groups.google.com/group/firephp-dev](http://groups.google.com/group/firephp-dev)

To keep track of it create an issue at: [http://code.google.com/p/firephp/issues/list](http://code.google.com/p/firephp/issues/list)

The feature requests will be moved from the google code issue tracker to various new projects in future.


Server Libraries
----------------

You need a server library to send data to FirePHP.

The FirePHPCore server library project is here: [http://github.com/cadorn/firephp-libs](http://github.com/cadorn/firephp-libs)

Additional libraries and framework integrations can be found here: [http://www.firephp.org/Wiki/Libraries/FirePHPCore](http://www.firephp.org/Wiki/Libraries/FirePHPCore)


Dev Setup
=========

Requirements
------------

  * [Firefox 3.6+](http://www.mozilla.com/en-US/firefox/)
  * [PINF](http://github.com/cadorn/pinf) *(NOTE: There is no release for PINF yet. Will be coming very soon.)*.
  * [Phing](http://phing.info/trac/wiki/Users/Download)

Install
-------

Checkout the workspace and switch to it:

    pinf checkout-workspace -s github.com/cadorn/firephp-extension

Make sure you have a firefox binary registered:

    nr add-bin /Applications/Firefox.app/Contents/MacOS/firefox-bin

Create a firefox profile. Install [Firebug 1.5+](http://getfirebug.com/) before closing the browser again.

    nr create-profile --dev master

To add a source version of Firebug instead use:

    nr add-extension -l --profile master /path/to/extension/root

Add the firefox extension to the profile:

    nr add-extension -l --profile master .

Launch the profile:

    nr launch --dev --profile master





License
=======

Software License Agreement (New BSD License)

Copyright (c) 2006-2010, Christoph Dorn
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

    * Neither the name of Christoph Dorn nor the names of its
      contributors may be used to endorse or promote products derived from this
      software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
