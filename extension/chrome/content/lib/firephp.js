
define([
	"firebug/lib/object",
    "firebug/firefox/firefox",
    "firephp/lib/wildfire",
    "firephp/lib/renderer",
    "firephp/lib/viewer",
    "firephp/lib/lib",
    "firebug/firefox/window"
],
function(Obj, Firefox, Wildfire, Renderer, Viewer, FirePHPLib, WINDOW)
{
	const FIREBUG_MIN_VERSION = "1.9";
	const PREFS_DOMAIN = "extensions.firephp";
	const URLS = {
	    hq: "http://www.firephp.org/HQ",
	    main: "http://www.firephp.org/",
	    docs: "http://www.firephp.org/HQ/Use.htm",
	    discuss: "http://www.firephp.org/HQ/Help.htm",
	    issues: "http://code.google.com/p/firephp/issues/list",
	    donate: "http://www.firephp.org/HQ/Contribute.htm?Trigger=Donate",
	    faq: "http://www.firephp.org/Wiki/Reference/FAQ",
	    twitter: "http://twitter.com/firephplib"
	};
	
	const Cc = Components.classes;
	const Ci = Components.interfaces;

	const observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	const prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch2);
	
	var firephp = null,
		requestObserver = null,
		prefsObserver = null,
		netMonitorListener = null,
		requestProcessor = null;

	
	var FirePHP = function()
	{
		this.version = "%%Version%%";
	    // During development
	    if (this.version === ("%%"+"Version"+"%%")) {
	        this.version = "0.6";
	    }
		this.app = null;
		this.enabled = false;

		this.activeBrowser = null;
        this.activeContext = null;
        
        this.commandLineSmallText = '';
        
        this.renderer = null;
        this.viewer = null;
	}
	
	FirePHP.prototype.init = function(app)
	{
		this.app = app;
		
		var self = this;
		
        this.viewer = new Viewer(this);
        this.renderer = new Renderer(this);
		
		prefs.addObserver(PREFS_DOMAIN, prefsObserver, false);
				
		Firebug.FirePHPModule = Obj.extend(Firebug.ActivableModule,
		{
		    onSuspendFirebug: function()
		    {
		        self.app.logger.debug("Firebug.FirePHPModule::onSuspendFirebug()");
		        self.disable();
		    },
		    
		    onResumeFirebug: function()
		    {
		        self.app.logger.debug("Firebug.FirePHPModule::onResumeFirebug()");
		    },

		    initContext: function(context)
		    {
		        self.app.logger.debug("Firebug.FirePHPModule::initContext()");
	        	self.enable();
	        	
	            self.viewer.hide(true);
		    },
		    
		    showContext: function(browser, context)
		    {
		        self.app.logger.debug("Firebug.FirePHPModule::showContext()");

		        self.activeBrowser = browser;
		        self.activeContext = context;
		    },

		    destroyContext: function(context)
		    {
		        self.app.logger.debug("Firebug.FirePHPModule::destroyContext()");
		    },
		    
		    reattachContext: function(browser, context)
		    {
		        self.app.logger.debug("Firebug.FirePHPModule::reattachContext()");
		    },
		    
		    showPanel: function(browser, panel)
		    {
		        self.app.logger.debug("Firebug.FirePHPModule::showPanel()");
		    }
		});
		
		Firebug.FirePHPModule.firephp = this;

		Firebug.registerActivableModule(Firebug.FirePHPModule);
		

    	setTimeout(function()
    	{
	        if (!self.getPref("panelTipShowed"))
	        {
	        	showNotification("firephp-enable-firebug-panels");
	        }
	        
	        var version = Firebug.version.replace(/X/, "");
	        var result = Cc["@mozilla.org/xpcom/version-comparator;1"].getService(Ci.nsIVersionComparator).compare(version, FIREBUG_MIN_VERSION);
	        if (result < 0)
	        {
	        	self.setPref("enabled", false);
	            showNotification("firephp-upgrade-firebug");
	        }
	
	        var currentVersion = self.getPref("currentVersion");
	        var previousVersion = self.getPref("previousVersion");
	        if (currentVersion != self.version)
	        {
	        	if (!self.getPref("followOnTwitterNoticeShowed"))
	        	{
	        		showNotification("firephp-follow-on-twitter");
	        		self.setPref("followOnTwitterNoticeShowed", true);
	        	}
	        	var url = '';
	        	if (previousVersion) {
	        		url = "http://www.firephp.org/HQ/Contribute.htm?Trigger=Upgrade";
	        	} else {
	        		url = "http://www.firephp.org/HQ/Install.htm?Trigger=Install";
	        	}

	        	WINDOW.openNewTab(url);
		    
	        	self.setPref("previousVersion", ""+currentVersion);
	        	self.setPref("currentVersion", ""+self.version);
	        }
    	}, 2000);
	}

	FirePHP.prototype.shutdown = function(app)
	{
		this.app = app;
		
		prefs.removeObserver(PREFS_DOMAIN, prefsObserver, false);
	}

	FirePHP.prototype.enable = function()
	{
		// Only enable if our preference allows us to
    	if (!this.getPref("enabled"))
    	{
    		this.disable();
    		return;
    	}
    		
    	if (this.enabled)
			return;
		
		this.enabled = true;
		
        this.app.logger.debug("FirePHP.enable()");

        observerService.addObserver(requestObserver, "http-on-modify-request", false);
        
        Firebug.NetMonitor.addListener(netMonitorListener);
	}

	FirePHP.prototype.disable = function()
	{
		if (!this.enabled)
			return;

		this.enabled = false;
		
        this.app.logger.debug("FirePHP.disable()");

        Firebug.NetMonitor.removeListener(netMonitorListener);
        
        observerService.removeObserver(requestObserver, "http-on-modify-request", false);        
	}

	FirePHP.prototype.logWarning = function(args)
    {
	    return Firebug.Console.logFormatted(args, this.activeContext, "warn", false, null);
    }
	
	FirePHP.prototype.setWindowStatusBarText = function(text)
	{
	    var commandLineSmall = Firebug.chrome.$("fbCommandLine");
	    if (text === null)
	    {
	    	commandLineSmall.value = this.commandLineSmallText;
	    } else {
	    	this.commandLineSmallText = commandLineSmall.value;
	    	commandLineSmall.value = text;
	    }
	}

	FirePHP.prototype.setPref = function(name, value)
	{
		return Firebug.setPref(PREFS_DOMAIN, name, value);
	}

	FirePHP.prototype.getPref = function(name)
	{
		return Firebug.getPref(PREFS_DOMAIN, name);
	}
	
	FirePHP.prototype.visitWebsite = function(which)
	{
		if (which === "hq") {
	        WINDOW.openNewTab(URLS[which] + "?Trigger=User");
		} else {
			WINDOW.openNewTab(URLS[which]);
	    }
	}
	
	FirePHP.prototype.openAboutDialog = function()
	{
        Components.utils["import"]("resource://gre/modules/AddonManager.jsm");

        AddonManager.getAddonByID("FirePHPExtension-Build@firephp.org", function(addon) {
            openDialog("chrome://mozapps/content/extensions/about.xul", "",
            "chrome,centerscreen,modal", addon);
        });
	}
	
	FirePHP.prototype.onOptionsShowing = function(popup)
	{
		for (var child = popup.firstChild; child ; child = child.nextSibling)
		{
			if (child.localName === "menuitem")
			{
				var option = child.getAttribute("option");
				if (option)
				{
					child.setAttribute("checked", ((this.getPref(option) === true)?"true":""));
				}
			}
		}
	};
	
	FirePHP.prototype.onToggleOption = function(menuitem)
	{
		var option = menuitem.getAttribute("option");
		var checked = (menuitem.getAttribute("checked") === "true")?true:false;

		this.setPref(option, checked);
	      
		if (option === "enabled" && checked) {
			if (this.activeContext) {
				if (!Firebug.NetMonitor.isEnabled(this.activeContext) ||
				    !Firebug.Console.isEnabled(this.activeContext))
				{
					showNotification("firephp-enable-firebug-panels");
				}
			}
		}
	};
	
	function showNotification(name)
	{
        firephp.app.logger.debug("showNotification('" + name + "')");

        var nb = Firefox.getTabBrowser().getNotificationBox();
	    
	    if (name === "firephp-follow-on-twitter")
	    {
	        nb.appendNotification("FirePHP is evolving! You can follow progress on twitter.",
	            name,
	            'chrome://firephp/skin/FirePHP_16.png',
	             nb.PRIORITY_INFO_LOW, [{
	                label: 'Follow FirePHP on Twitter',
	                callback: function() {
	                	WINDOW.openNewTab(URLS["twitter"])
	                }
	            }]);
	    } else
	    if (name === "firephp-enable-firebug-panels") {
	        nb.appendNotification("Make sure you have the Firebug Console and Net panels enabled to use FirePHP!",
	            name,
	            'chrome://firephp/skin/FirePHP_16.png',
	             nb.PRIORITY_INFO_HIGH, [{
	                label: 'Dismiss',
	                callback: function() {
	    	        	firephp.setPref("panelTipShowed", true);
	                }
	            }]);
	    } else
	    if (name === "firephp-upgrade-firebug") {
	        nb.appendNotification("You need Firebug " + FIREBUG_MIN_VERSION + "+ to use FirePHP 0.6.3+ on Firefox 5+!",
	            name,
	            'chrome://firephp/skin/FirePHP_16.png',
	             nb.PRIORITY_CRITICAL_HIGH, [{
	                label: 'Install',
	                callback: function() {
	                	WINDOW.openNewTab("http://getfirebug.com/downloads")
	                }
	            }]
	        );
	        
	    }
	}

	
	var RequestProcessor = function() {};
	
	RequestProcessor.prototype.parseHeaders = function (headers_in, parser)
	{
 		var info = [],
 			header_indexes = [],
 			header_values = [],
 			data = '';

 		function parseHeader(name, value)
 		{
 			name = name.toLowerCase();

			if (name.substr(0,15) === "x-firephp-data-" && 
				name.length === 27)
			{
				header_indexes[header_indexes.length] = name.substr(15);
				header_values[header_values.length] = value;
			} else
			if (name === "x-firephp-data" ||
			    name === "firephp-data" || 
			    name.substr(0,15) === "x-firephp-data-" ||
			    name.substr(0,13) === "firephp-data-")
			{
				data += value;
			} else
			if (name === "x-firephp-processorurl") {
				info['processorurl'] = value;
			} else
			if (name === "x-firephp-rendererurl" ||
	            name === "firephp-rendererurl" ||
	            name === "firephp-mask")
			{
				info['rendererurl'] = value;
			}      
 		}

 		var plugin = new Wildfire.Plugin.FirePHP();
 		
 		plugin.init();

 		info["plugin"] = plugin;

 		if (parser === "visit") {
	        headers_in.visitResponseHeaders({
	            visitHeader: function(name, value)
	            {
	                plugin.channel.messageReceived(name, value);
	                parseHeader(name, value);
	            }
	        });
	    } else
	    if (parser === "array") {
	        for ( var index in headers_in ) {
	            plugin.channel.messageReceived(headers_in[index].name, headers_in[index].value);
	            parseHeader(headers_in[index].name, headers_in[index].value);
	        }
	    }

 		plugin.channel.allMessagesReceived();
 		
 		if (header_indexes.length > 0) {
			var headers = FirePHPLib.sortSecondByFirstNumeric(header_indexes, header_values);
			for( var index in headers ) {
				data += headers[index];
			}
			info['data'] = data;
		} else {
		    info['data'] = data;
		}
    
 		return info;
    }

	RequestProcessor.prototype.renderRequest = function(url, info)
	{
        var data = info["data"],
        	wildfire =  info["plugin"];

        if (!data && !wildfire.hasMessages()) {
            return;
        }

        firephp.renderer.renderRequest({
        	data: data,
            wildfire: wildfire,
            context: firephp.activeContext,
            url: url
        });
    },	

	requestProcessor = new RequestProcessor();

	
	prefsObserver = 
	{
	    observe: function(subject, topic, data)
	    {
	        if (topic != "nsPref:changed")
	            return;
	        
	        var prefName = data.substring(PREFS_DOMAIN.length + 1);

	        if (prefName === "enabled")
	        {
	        	if (firephp.getPref(prefName))
	        	{
	        		firephp.enable();
	        	}
	        	else
	        	{
	        		firephp.disable();
	        	}
	        }
	    }
	}
	
	requestObserver =
	{
	    observe: function(subject, topic, data)
	    {
		    if (topic === "http-on-modify-request")
		    {
		        var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);

		        firephp.app.logger.debug("Adding FirePHP headers to request: " + httpChannel.URI.spec);

		        if (firephp.getPref("modifyua"))
		        {
		        	// Identify FirePHP by modifying User-Agent header
		        	if (httpChannel.getRequestHeader("User-Agent").match(/\sFirePHP\/([\.|\d]*)\s?/) === null)
			        {
		                httpChannel.setRequestHeader("User-Agent", 
		                	httpChannel.getRequestHeader("User-Agent") + ' '+
		                    "FirePHP/" + firephp.version, false);
			        }
		        }
		        else
		        {
		        	// Identify FirePHP by separate header
		            httpChannel.setRequestHeader("X-FirePHP-Version", FirePHP.version, false);
		        }

		        // FirePHP 1.0 compatibility
	            httpChannel.setRequestHeader("x-insight", "activate", false);

		        // Add some info about FirePHP and Firebug into the header to be sent to FirePHP related sites.
		        switch(httpChannel.URI.host.toLowerCase())
		        {
		            case "meta.firephp.org":
		            case "www.firephp.org":
		            case "pear.firephp.org":
		            case "forum.firephp.org":
		                httpChannel.setRequestHeader("X-FirePHP-Agent",
		                    '{"firephp.version":"' + firephp.version + 
		                    '","firephp.version.previous":"' + firephp.getPref("previousVersion") +
		                    '","firebug.version":"' + Firebug.version + 
		                    '"}', false);
		                break;
		        }
		    }
	    }
	};
	
	netMonitorListener = {
	    onResponseBody: function(context, file)
	    {
	        firephp.app.logger.debug("netMonitorListener.onResponseBody(): " + file.href);

	        var headers = null;

	        try {

	        	headers = requestProcessor.parseHeaders(file.responseHeaders, "array");

	        } catch (e) {
	        	firephp.logger.debug("Error parsing headers!", e);
	            firephp.logWarning(['Error parsing headers!', e]);
	        }
	        
	        try {

	        	requestProcessor.renderRequest(file.href, headers);
	        
	        } catch (e) {
	        	firephp.logger.debug("Error rendering request!", e);
	            firephp.logWarning(['Error rendering request!', e]);
	        }
	    }
	};

	return (firephp = new FirePHP());
});
