
define([
    "firebug/lib/trace",
    "firebug/trace/traceModule",
    "firebug/trace/traceListener",
    "firephp/lib/firephp",
],
function(FBTrace, TraceModule, TraceListener, FirePHP)
{
	// NOTE: This needs to stay here as we need to register the stylesheet right away
	//       otherwise Firebug may skip it!
	// TODO: Trigger stylesheet inject in Firebug if added after init.
    Firebug.registerStylesheet("resource://firephp/content/lib/console.css");

	var FirePHPApp = function() {}
	
	FirePHPApp.prototype.initialize = function()
	{
	    // Register trace customization listener for FBTrace. DBG_HELLOAMD represents a CSS rule
	    // that is automatially associated with all logs prefixed with "helloAMD;".
	    // The prefix is removed (third parameter is true).
	    // The last parameter represents URL of the stylesheet that should be used by
	    // the tracing console.
	    this.traceListener = new TraceListener("FirePHP;", "DBG_FIREPHP", true);
	    TraceModule.addListener(this.traceListener);
	
	    this.logger = {
	    	debug: function(msg, obj)
	    	{
	            if (!FBTrace.DBG_FIREPHP)
	            	return;
	            if (typeof obj !== "undefined") {
	                FBTrace.sysout("FirePHP; " + msg, obj);
	            } else {
	                FBTrace.sysout("FirePHP; " + msg);
	            }
	        }
	    }
	
	    this.logger.debug("Initialize AMD-based FirePHP Firebug Extension");
	    
	    FirePHP.init(this);
	};
	
	FirePHPApp.prototype.shutdown = function()
	{
	    this.logger.debug("Shutdown AMD-based FirePHP Firebug Extension");
	
	    FirePHP.shutdown();
	
	    TraceModule.removeListener(this.traceListener);
	};

	return new FirePHPApp();

});
