
define([
    "firebug/lib/domplate",
    "firephp/lib/reps",
	"firebug/lib/css"
],
function(DOMPLATE, REPS, CSS)
{
	var Renderer = function(firephp)
	{
        var self = this;

        this.firephp = firephp;
        this.initialized = false;
        this.consoleTemplates = [];
        this.sourceURL = null;

        this.defaultRep = null;
        this.reps = [];

        REPS.init(this);
	};
    
	Renderer.prototype.RegisterConsoleTemplate = function(Name, Template)
    {
        this.consoleTemplates[Name] = Template;
    };

    Renderer.prototype.setDefaultRep = function(rep)
    {
        this.defaultRep = rep;
    };
    
    Renderer.prototype.registerRep = function()
    {
        this.reps.push.apply(this.reps, arguments);
    };

	Renderer.prototype.getRep = function(object)
    {
        var type = typeof(object);
        for (var i = 0; i < this.reps.length; ++i)
        {
            var rep = this.reps[i];
            try
            {
                if (rep.supportsObject(object, type)) {
                	return rep;
                }
            } catch (e) {}
        }
        return this.defaultRep;
    };

    Renderer.prototype.logToFirebug = function(TemplateName, Data, UseFirebugTemplates, Meta, context)
    {
        var oo = false;
        
        context = context || null;
        
        if (this.consoleTemplates[TemplateName]) {
            oo = Firebug.Console.logRow(function(object, row, rep) {
                return rep.tag.append({object: object, meta:Meta}, row);
            }, Data, context, this.consoleTemplates[TemplateName].className, this.consoleTemplates[TemplateName], null, false);
        } else
        if(UseFirebugTemplates) {
        
            oo = Firebug.Console.logFormatted([Data], context, TemplateName, true, null);
        
        } else {
        
            // If no custom template is requested we use FirePHP templates
            // If data is a string just use a simple text renderer
            
            var rep = FirebugReps.PHPVariable;
            var firePHPRep = this.getRep(Data);
            
            if (firePHPRep === FirebugReps.FirePHPString) {
                rep = FirebugReps.FirePHPText;
            } else
            if (firePHPRep === FirebugReps.FirePHPBoolean) {
                rep = firePHPRep;
            } else
            if (firePHPRep === FirebugReps.FirePHPNumber) {
                rep = firePHPRep;
            }

            this.firephp.app.logger.debug("Renderer.logToFirebug() :: rep", rep);
            
            oo = Firebug.Console.logRow(function(object, row, rep) {
                return rep.tag.append({object: object, meta:Meta}, row);
            }, Data, context, TemplateName, rep, null, true);

            // Make some URLs links
            try {
                if(Data && Data.match && Data.match(/http:\/\/upgrade.firephp.org\//)) {
                   oo.innerHTML = oo.innerHTML.replace("http://upgrade.firephp.org/", '<a target="_blank" href="http://upgrade.firephp.org/">http://upgrade.firephp.org/</a>');
                }
            } catch(e) {}
        }
        return oo;
    };

    Renderer.prototype.renderRequest = function(options)
    {
    	var Wildfire = options.wildfire,
    		URL = options.url,
    		Data = options.data;

    	if (Data || Wildfire.hasMessages())
    	{
    		Firebug.Console.openGroup([URL], options.context, "firephpRequestGroup", null, true);
    		
    		// We wrap the logging code to ensure we can close the group
    		// just in case something goes wrong.
    		
    		try {
	            if(Data)
	            {
    		        this.firephp.app.logger.debug("Renderer.renderRequest() :: has data");

    		        var data = JSON.parse(Data);
	          
	            	if (data['FirePHP.Firebug.Console'])
	            	{
	            		var peerInfo = {
	            			    uri: "http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/",
	                            version: "0.2.0"
	                        };
	
	            		this.logToFirebug('upgrade', {peerInfo: peerInfo}, false, null, options.context);

	            		for (var index in data['FirePHP.Firebug.Console'])
	            		{
	            		    var item = data['FirePHP.Firebug.Console'][index];
	            		    if (item && item.length === 2)
	            		    {
	            		    	this.processMessage(item[0], item[1], options.context);
	            		    }
	            		}
	            	}
	            }      
    		} catch(e) {
    			this.logToFirebug('error', ['There was a problem writing your data from X-FirePHP-Data[\'FirePHP.Firebug.Console\'] to the console.', e], true, null, options.context);
    		}

    		try {
    			if (Wildfire.hasMessages())
    			{
    		        this.firephp.app.logger.debug("Renderer.renderRequest() :: has wildfire messages");

    		        var messages = Wildfire.getMessages('http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1');
    				if (messages && messages.length > 0)
    				{
        		        this.firephp.app.logger.debug("Renderer.renderRequest() :: wildfire console message count: " + messages.length);

        		        for ( var index in messages )
    					{
    						var item = JSON.parse(messages[index]);
    						this.processMessage(item[0].Type, item[1], item[0], options.context);
    					}
    				}

    				messages = Wildfire.getMessages('http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1');

    				if (messages && messages.length > 0)
    				{
        		        this.firephp.app.logger.debug("Renderer.renderRequest() :: wildfire dump message count: " + messages.length);

        		        for( var index in messages ) {
    						var item = JSON.parse(messages[index]);
    						this.processMessage("dump", item, {"Label": "Dump"}, options.context);
    					}
    				}
    			}
     		} catch(e) {
     			this.logToFirebug('error', ['There was a problem writing your data from the Wildfire Plugin http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1',e], true, null, options.context);
    		}
     		Firebug.Console.closeGroup(options.context, true);
    	}
    };
    
    Renderer.prototype.processMessage = function(mode, data, meta, context)
    {
    	mode = mode.toLowerCase();
    	
        // Change mode from TRACE to EXCEPTION for backwards compatibility
    	if (mode === 'trace') {
    		var change = true;
    		for (var key in data) {
    			if (key == 'Type') {
    				change = false;
    			}
    		}
    		if (change) {
    			mode = 'exception';
    			data.Type = 'throw';
    		}
    	}
    	
    	if (mode === 'group_start') {
    		var msg = null;
    		if(meta && meta.Label) {
    			msg = [meta.Label];
    		} else {
    			msg = [data[0]];
    		}
    		if(meta && (meta.Collapsed || meta.Color)) {
  	            // NOTE: Throttleing is disabled which may caue the group to be interted in a different
	            //       index than originally intended as other messages are inserted with throttleing enabled.
	            //       This should be done in a better way in future.
	            var row = Firebug.Console.openGroup(msg, context, "group", null, true);
	          
	            if(meta.Collapsed && meta.Collapsed=='true') {
	                CSS.removeClass(row, "opened");
	            }
	            if(meta.Color) {
	                row.style.color = meta.Color;
	            }
    		} else {
    			Firebug.Console.openGroup(msg, context, "group", null, true);
    		}
    	} else
    	if (mode === 'group_end') {
    		Firebug.Console.closeGroup(context, true);
    	} else
    	if (mode === 'log' || mode === 'info' || mode === 'warn' || mode === 'table' || mode === 'trace') {
    		this.logToFirebug(mode, data, false, meta, context);
    	} else 
        if (mode === 'error' || mode === 'exception') {
        	Firebug.Errors.increaseCount(context);
        	this.logToFirebug(mode, data, false, meta, context);
        } else 
        if (mode === 'dump') {
        	this.logToFirebug("log", data, false, meta, context);
        }
    };
    
	return Renderer;
});
