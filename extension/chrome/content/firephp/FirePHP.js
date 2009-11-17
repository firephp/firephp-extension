/* ***** BEGIN LICENSE BLOCK *****
 * 
 * This software is distributed under the New BSD License.
 * See LICENSE file for terms of use.
 * 
 * ***** END LICENSE BLOCK ***** */

var externalMode = (window.location == "chrome://firebug/content/firebug.xul");


if(externalMode) {
	var detachArgs = window.arguments[0];
	var FBL = detachArgs.FBL;            
	var Firebug = detachArgs.Firebug;
}


FBL.ns(function() { with (FBL) {

const FB_NEW = (Firebug.version == '1.2'
                || Firebug.version == '1.3'
                || Firebug.version == '1.4')?true:false;


const Cc = Components.classes;
const Ci = Components.interfaces;

const nsIPrefBranch = (FB_NEW)?Ci.nsIPrefBranch:FirebugLib.CI("nsIPrefBranch");
const nsIPrefBranch2 = (FB_NEW)?Ci.nsIPrefBranch2:FirebugLib.CI("nsIPrefBranch2");
const nsIPermissionManager = (FB_NEW)?Ci.nsIPermissionManager:FirebugLib.CI("nsIPermissionManager");

const PrefService = (FB_NEW)?Cc["@mozilla.org/preferences-service;1"]:FirebugLib.CC("@mozilla.org/preferences-service;1");
const PermManager = (FB_NEW)?Cc["@mozilla.org/permissionmanager;1"]:FirebugLib.CC("@mozilla.org/permissionmanager;1");

const nsIHttpChannel = (FB_NEW)?Ci.nsIHttpChannel:CI("nsIHttpChannel");
const nsIWebProgress = (FB_NEW)?Ci.nsIWebProgress:CI("nsIWebProgress");
const nsIWebProgressListener = (FB_NEW)?Ci.nsIWebProgressListener:CI("nsIWebProgressListener");
const nsISupportsWeakReference = (FB_NEW)?Ci.nsISupportsWeakReference:CI("nsISupportsWeakReference");
const nsISupports = (FB_NEW)?Ci.nsISupport:CI("nsISupports");
  
const ioService = CCSV("@mozilla.org/network/io-service;1", "nsIIOService");
  
const observerService = CCSV("@mozilla.org/observer-service;1", "nsIObserverService");


const STATE_TRANSFERRING = nsIWebProgressListener.STATE_TRANSFERRING;
const STATE_IS_DOCUMENT = nsIWebProgressListener.STATE_IS_DOCUMENT;
const STATE_STOP = nsIWebProgressListener.STATE_STOP;
const STATE_IS_REQUEST = nsIWebProgressListener.STATE_IS_REQUEST;
const NOTIFY_ALL = nsIWebProgress.NOTIFY_ALL;


const firephpURLs =
{
    hq: "http://www.firephp.org/HQ",
    main: "http://www.firephp.org/",
    docs: "http://www.firephp.org/HQ/Use.htm",
    discuss: "http://www.firephp.org/HQ/Help.htm",
    issues: "http://code.google.com/p/firephp/issues/list",
    donate: "http://www.firephp.org/HQ/Contribute.htm?Trigger=Donate"
};


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 

const prefs = PrefService.getService(nsIPrefBranch2);
const pm = PermManager.getService(nsIPermissionManager);

const DEBUG = false;


var FirePHP = top.FirePHP = {

  version: '%%Version%%',

  prefDomain: "extensions.firephp",
  
  defaultRep: null,
  reps: [],
  
  
  /* This variable is only used for ff2 */
  enabled: false,

  initialize: function() {
    
    var currentVersion = FirePHP.getPref(FirePHP.prefDomain,'currentVersion');
    var previousVersion = FirePHP.getPref(FirePHP.prefDomain,'previousVersion');
    if(currentVersion!=FirePHP.version) {

      var url = '';
      if(previousVersion) {
        url = "http://www.firephp.org/HQ/Contribute.htm?Trigger=Upgrade";
      } else {
        url = "http://www.firephp.org/HQ/Install.htm?Trigger=Install";
      }

      setTimeout(function() {
                   openNewTab(url);
                 },2000);

      FirePHP.setPref(FirePHP.prefDomain,'previousVersion',''+currentVersion);
      FirePHP.setPref(FirePHP.prefDomain,'currentVersion',''+FirePHP.version);
    }
  },
  
  getPreviousVersion: function() {
    return FirePHP.getPref(FirePHP.prefDomain,'previousVersion');
  },
  
  /* Enable and disable FirePHP
   * At the moment this enables and disables the FirePHP accept header
   */ 
  enable: function() {
    
    this.enabled = true;
    
    /* Enable the FirePHP Service Component to set the multipart/firephp accept header */  
    observerService.addObserver(this, "http-on-modify-request", false);

    Firebug.NetMonitor.addListener(this);
  },
  disable: function() {
    
    this.enabled = false;
    
    /* Enable the FirePHP Service Component to set the multipart/firephp accept header */  
    observerService.removeObserver(this, "http-on-modify-request");
      
    Firebug.NetMonitor.removeListener(this);
  },


  /* Used for FB1.2 (>= b4) */
/* 
  onLoad: function(context, file)
  {
    if(DEBUG) dump("--> FirePHP.onLoad"+"\n");

//dump("--> " + file.method + " " + file.href+"\n");

    if(Firebug.FirePHP.processQueOnWatchWindow) {
      // Process right away as context is already initialized
      Firebug.FirePHP._processRequest(file.href,
                                      FirePHP.parseHeaders(file.responseHeaders,'array'));
    } else {
      // Que processing until after context is initialized. This is for whenever a new page is loaded.
      Firebug.FirePHP.queFile(file);
    }
  },
*/

  /* Used for FB >= 1.4a13 */
  onResponseBody: function(context, file)
  {

    if(DEBUG) dump("--> FirePHP.onResponseBody"+"\n");
      
      
//    if(Firebug.FirePHP.processQueOnWatchWindow) {
      /* Process right away as context is already initialized */
      Firebug.FirePHP._processRequest(file.href,
                                      FirePHP.parseHeaders(file.responseHeaders,'array'));
//    } else {
      /* Que processing until after context is initialized. This is for whenever a new page is loaded. */
//      Firebug.FirePHP.queFile(file);
//    }
  },
  

  isEnabled: function() {
    
    return FirePHP.getPref(FirePHP.prefDomain, "enabled");
    
  },
  
    
  observe: function(subject, topic, data)
  {
    if (topic == "http-on-modify-request") {
      var httpChannel = subject.QueryInterface(nsIHttpChannel);

      /* Add FirePHP/X.X.X to User-Agent header if not already there and firephp is enabled.
       * If firephp is not enabled remove header from request if it exists.
       */

      if(httpChannel.getRequestHeader("User-Agent").match(/\sFirePHP\/([\.|\d]*)\s?/)==null) {
        if (this.isEnabled()) {
          httpChannel.setRequestHeader("User-Agent",httpChannel.getRequestHeader("User-Agent") + ' '+
            "FirePHP/" + this.version, false);
        }
      }
      
      /* Add some info about FirePHP and Firebug into a header to be sent to FirePHP
       * related sites.
       */
      
      switch(httpChannel.URI.host.toLowerCase()) {
        case "meta.firephp.org":
        case "www.firephp.org":
        case "pear.firephp.org":
        case "forum.firephp.org":
        case 'com.cadorn.websites.firephp.macbook.home.cadorn.net':
          httpChannel.setRequestHeader("X-FirePHP-Agent",
            '{"firephp.version":"'+FirePHP.version+'","firephp.version.previous":"'+FirePHP.getPreviousVersion()+'","firebug.version":"'+Firebug.version+'"}'
            , false);
          break;
      }
    }
  },  
		
  isURIAllowed: function(host)
  {
    if(!host) return false;
    var uri = ioService.newURI('http://'+host, null, null);
    return uri && 
        (pm.testPermission(uri, "firephp") == nsIPermissionManager.ALLOW_ACTION);
  },

  enableSite: function(host)
  {
    var uri = ioService.newURI('http://'+host, null, null);
    pm.add(uri, "firephp", nsIPermissionManager.ALLOW_ACTION);
  },
  
  
  parseHeaders: function(headers_in,parser) {
    
 		var info = [];
   
		var header_indexes = [];
		var header_values = [];
		var data = '';
    
    function parseHeader(name,value) {
				name = name.toLowerCase();

				if(name.substr(0,15)=='x-firephp-data-' && name.length==27) {

					header_indexes[header_indexes.length] = name.substr(15);
					header_values[header_values.length] = value;

				} else							
				if(name=='x-firephp-data' ||
					 name=='firephp-data' || 
					 name.substr(0,15)=='x-firephp-data-' ||
					 name.substr(0,13)=='firephp-data-') {

					data += value;
				
				} else
				if(name=='x-firephp-processorurl') {
					info['processorurl'] = value;
				} else
				if(name=='x-firephp-rendererurl' ||
           name=='firephp-rendererurl' ||
           name=='firephp-mask') {
					info['rendererurl'] = value;
				}      
    }
    
    /* New Wildfire HttpHeaders Channel */
    var plugin = new Wildfire.Plugin.FirePHP;
    plugin.init();

    info['plugin'] = plugin;
    
    if(parser=='visit') {

      headers_in.visitResponseHeaders({
        visitHeader: function(name, value)
        {
          plugin.channel.messageReceived(name, value);
          parseHeader(name,value);
        }
      });						
      
    } else
    if(parser=='array') {
      for( var index in headers_in ) {
        plugin.channel.messageReceived(headers_in[index].name, headers_in[index].value);
        parseHeader(headers_in[index].name,headers_in[index].value);
      }
    }
    
    plugin.channel.allMessagesReceived();
            
    
		/* Sort the header and create final data object */
		
		if(header_indexes.length>0) {
			
			var headers = FirePHPLib.sortSecondByFirstNumeric(header_indexes,header_values);
			
			for( var index in headers ) {
				data += headers[index];
			}
      
      info['data'] = data;

		} else {
      
      info['data'] = data;
    }
    
    return info;
  },
  
  isLoggingData: false,
  
  commandLineSmallText: '',
  commandLineLargeText: '',
  
  setWindowStatusBarText: function(text) {
        
    var commandLineSmall = FirebugContext.chrome.$("fbCommandLine");
    var commandLineLarge = FirebugContext.chrome.$("fbLargeCommandLine");
    
    if(text==null) {
      commandLineSmall.value = this.commandLineSmallText;
      commandLineLarge.value = this.commandLineLargeText;
    } else {
      this.commandLineSmallText = commandLineSmall.value;
      commandLineSmall.value = text;
      this.commandLineLargeText = commandLineLarge.value;
      commandLineLarge.value = text;
    }
  },
  
  lastInspectorVariable: null,
  inspectorPinned: false,
  
  
  setVariableViewerWidth: function(width) {
      FirePHP.setPref(FirePHP.prefDomain,'variableViewerWidth', width);
  },

  getVariableViewerWidth: function() {
      var w = FirePHP.getPref(FirePHP.prefDomain,'variableViewerWidth');
      if(!w) {
        w = '50%';
        this.setVariableViewerWidth(w);
      }
      return w;
  },
  
  sizeVariableInspectorOverlayWidthTo: function(size) {
    
    this.setVariableViewerWidth(size);
    
    this.hideVariableInspectorOverlay(true);
    
    var obj = this;
    
    setTimeout(function() {
      obj.showVariableInspectorOverlay(obj.lastInspectorVariable, true);
    }, 200);

  },
  
  showVariableInspectorOverlay: function(object,pinned) {
    
    if(this.inspectorPinned && !pinned) {
      return; 
    }
    this.inspectorPinned = pinned;
    
    if(object==this.lastInspectorVariable) {
//      return;
    }
        
    this.lastInspectorVariable = object;
    
    
      var browser = FirebugChrome.getCurrentBrowser();
      if(browser && browser.contentDocument) {
        
        var bx = browser.boxObject.x;
        var by = browser.boxObject.y;
        var bw = browser.boxObject.width;
        var bh = browser.boxObject.height;
        
        var w = bw-100;

        switch(this.getVariableViewerWidth()) {
          case '50%':
            w = bw/100*50;
            break;
          case '70%':
            w = bw/100*70;
            break;
          case '90%':
            w = bw/100*90;
            break;
        }

        // Set a minimum width of 500
        if(w<500) {
          w = 500;
        }
        var h = bh-40;
        
        var obj = FirebugChrome.window.document.getElementById('firephp-variable-inspector-overlay');
        
        obj.hidden = false;
        obj.setAttribute("style","left: "+(bx+(bw-w)/2)+"px; top: "+(by+(bh-h)/2)+"px; width: "+w+"px; height: "+h+"px;");

        
        var frame = FirebugChrome.window.document.getElementById('firephp-variable-inspector-iframe');
        
//        frame.setAttribute("style","width: "+w+"px; height: "+h+"px;");
        
        if(frame.contentWindow.renderVariable) {
          frame.contentWindow.renderVariable(object,pinned);
        } else {
          /* Need this for FF2 */
          setTimeout(function() {
            frame.contentWindow.renderVariable(object,pinned);
          }, 200);
        }
        
//        var content = frame.contentDocument.getElementById('content');
//        content.innerHTML = object;
        
      }
  },
  
  
  hideVariableInspectorOverlay: function(force) {
    
    if(this.inspectorPinned && !force) {
      return;
    }
    
    this.inspectorPinned = false;
    
    var obj = FirebugChrome.window.document.getElementById('firephp-variable-inspector-overlay');
    obj.hidden = true;
    
  },
  
  /* Can use Firebug.getPref() for FB 1.2+ */
  getPref: function(prefDomain, name)
  {
      var prefName = prefDomain + "." + name;

      var type = prefs.getPrefType(prefName);
      if (type == nsIPrefBranch.PREF_STRING)
          return prefs.getCharPref(prefName);
      else if (type == nsIPrefBranch.PREF_INT)
          return prefs.getIntPref(prefName);
      else if (type == nsIPrefBranch.PREF_BOOL)
          return prefs.getBoolPref(prefName);
  },

  /* Can use Firebug.getPref() for FB 1.2+ */
  setPref: function(prefDomain, name, value)
  {
      var prefName = prefDomain + "." + name;

      var type = prefs.getPrefType(prefName);
      if (type == nsIPrefBranch.PREF_STRING)
          prefs.setCharPref(prefName, value);
      else if (type == nsIPrefBranch.PREF_INT)
          prefs.setIntPref(prefName, value);
      else if (type == nsIPrefBranch.PREF_BOOL)
          prefs.setBoolPref(prefName, value);
      else if (type == nsIPrefBranch.PREF_INVALID)
          throw "Invalid preference "+prefName+" check that it is listed in defaults/prefs.js";
  },
  
    setDefaultRep: function(rep)
    {
        this.defaultRep = rep;
    },

  registerRep: function()
  {
      this.reps.push.apply(this.reps, arguments);
  },
  
  
  
    getRep: function(object)
    {

        var type = typeof(object);
if(DEBUG) dump('FirePHP.getRep() - type: '+type+' - object: '+object+"\n");
        for (var i = 0; i < this.reps.length; ++i)
        {
            var rep = this.reps[i];

            try
            {
                if (rep.supportsObject(object, type)) {

if(DEBUG) dump('FirePHP.getRep() -     use: '+rep.className+"\n");
                
                    return rep;
                }
            }
            catch (exc)
            {
            }
        }

if(DEBUG) dump('FirePHP.getRep() - use: '+this.defaultRep.className+' (default)'+"\n");
        return this.defaultRep;
  }
}


Firebug.FirePHP = extend(Firebug.Module,
{
	
  activeContext: null,
  activeBrowser: null,
  
//  requestBuffer: [],
  
//  processQueOnWatchWindow: false,

  contextShowing: 0,
    
  enable: function()
  {
//    this.requestBuffer = [];
		FirePHP.enable();
  },
  
  disable: function()
  {
		FirePHP.disable();
//    this.requestBuffer = [];
  },		
	

  initContext: function(context)
  {
    if(DEBUG) dump("--> Firebug.FirePHP.initContext"+"\n");
    
    FirePHP.hideVariableInspectorOverlay(true);
    
    monitorContext(context);
    
  },
  destroyContext: function(context)
  {
    if(DEBUG) dump("--> Firebug.FirePHP.destroyContext"+"\n");

    unmonitorContext(context);
    
//    this.processQueOnWatchWindow = false;
    this.contextShowing = 0;
  },
  
  reattachContext: function(browser, context)
  {
    if(DEBUG) dump("--> Firebug.FirePHP.reattachContext"+"\n");

    this.addStylesheets(true);
  },
  
//  watchWindow: function(context, win)
//  {
//    if(DEBUG) dump("--> Firebug.FirePHP.watchWindow (processQueOnWatchWindow: "+this.processQueOnWatchWindow+")"+"\n");

//    if (this.processQueOnWatchWindow) {
//      this.processRequestQue();
//    }
//  },
//  unwatchWindow: function(context, win)
//  {
//    if(DEBUG) dump("--> Firebug.FirePHP.unwatchWindow"+"\n");
//  },
  showPanel: function(browser, panel)
  {
    if(DEBUG) dump("--> Firebug.FirePHP.showPanel (contextShowing: "+this.contextShowing+")"+"\n");
    
    if(!FB_NEW || this.contextShowing>=1) {
      this.addStylesheets();
  
//      this.processQueOnWatchWindow = true;
      
//      this.processRequestQue();    
    }
  },
  
  addStylesheets: function(Force) {
    
    if(!Force) Force = false;
 
    /* Add any stylesheets if not added yet */
    try {
      if(this.activeContext) {

        var panel = this.activeContext.getPanel('console');
        if(panel) {
        
          this.addStyleSheet(panel.document,'chrome://firephp/content/panel.css');
          this.addStyleSheet(panel.document,'chrome://firephp/content/RequestProcessor.css');
        
          if(this.FirePHPProcessor) {
            for( var url in this.FirePHPProcessor.consoleStylesheets ) {
                this.addStyleSheet(panel.document,url);
            }
          }
        }
      }
    } catch(e) {}    
    
  },
  
  addStyleSheet: function(doc, url)
  {
      var id = hex_md5('Stylesheet:'+url);
      /* Make sure the stylesheet isn't appended twice. */
      if ($(id, doc)) return;

      var styleSheet = createStyleSheet(doc,url);
      styleSheet.setAttribute("id", id);
      addStyleSheet(doc, styleSheet);
  },
  
  showContext: function(browser, context)
  {
    if(DEBUG) dump("--> Firebug.FirePHP.showContext (externalMode: "+((externalMode)?'true':'false')+")"+"\n");
    
    this.activeBrowser = browser;
    this.activeContext = context;
    
    this.contextShowing++;
    
//FirePHPLib.dump(context,'context',false, true);    
    
  },
	 
/*
	queRequest: function(Request) {
    if(DEBUG) dump("--> Firebug.FirePHP.queRequest"+"\n");

		var http = QI(Request, nsIHttpChannel);
    var info = FirePHP.parseHeaders(http,'visit');
    this.requestBuffer.push([Request.name,info]);
    },

	queFile: function(File) {
    if(DEBUG) dump("--> Firebug.FirePHP.queFile ("+File.href+")"+"\n");

    this.requestBuffer.push([File.href,FirePHP.parseHeaders(File.responseHeaders,'array')]);
    },

	processRequest: function(Request) {
    if(DEBUG) dump("--> Firebug.FirePHP.processRequest"+"\n");

		var url = Request.name;
		var http = QI(Request, nsIHttpChannel);
    var info = FirePHP.parseHeaders(http,'visit');
    
    this._processRequest(url,info);
    },
   
   
	processRequestQue: function() {
    if(DEBUG) dump("--> Firebug.FirePHP.processRequestQue (requestBuffer: "+((this.requestBuffer)?'true':'false')+")"+"\n");

    if(!this.requestBuffer) return;

    for( var index in this.requestBuffer ) {
      this._processRequest(this.requestBuffer[index][0],this.requestBuffer[index][1]);
    }
    this.requestBuffer = [];
    }, 
*/

  
	_processRequest: function(url,info) {
    if(DEBUG) dump("--> Firebug.FirePHP._processRequest ("+url+")"+"\n");
    
    var mask = info['processorurl'];
    var data = info['data'];
    var wildfire =  info['plugin'];

		var domain = getDomain(mask);
    
		if(data || wildfire.hasMessages()) {
			if(!mask) {
				mask = 'chrome://firephp/content/RequestProcessor.js';
			} else {
  			if(!FirePHP.isURIAllowed(domain)) {
          this.logWarning(['By default FirePHP is not allowed to load your custom processor from "'+mask+'". You can allow this by going to the "Net" panel and clicking on the "Server" tab for this request.']);
  				mask = 'chrome://firephp/content/RequestProcessor.js';
        }
      }
			
			if(!this.FirePHPProcessor) {
				this.FirePHPProcessor = function() {
					return {
					  initialized: false,
            consoleStylesheets: [],
            consoleTemplates: [],
            sourceURL: null,
						_Init: function() {
							if(this.initialized) return;
              try {
  							this.Init();
  							this.initialized = true;
              } catch(e) {
              }           
						},
						Init : function() {
						},
						ProcessRequest: function() {
						},
            RegisterConsoleStyleSheet: function(URL) {
              this.consoleStylesheets[URL] = true;
            },
            RegisterConsoleTemplate: function(Name,Template) {
              this.consoleTemplates[Name] = Template;
            },
						logToFirebug: function(TemplateName, Data, UseFirebugTemplates, Meta) {
              var oo = false;
              FirePHP.isLoggingData = true;
              if (this.consoleTemplates[TemplateName]) {
                oo = Firebug.Console.logRow(function(object, row, rep)
                  {
                    return rep.tag.append({object: object, meta:Meta}, row);
                  }, Data, this.activeContext, this.consoleTemplates[TemplateName].className, this.consoleTemplates[TemplateName], null, false);
              } else
              if(UseFirebugTemplates) {

            	  oo = Firebug.Console.logFormatted([Data], this.activeContext, TemplateName, false, null);
              
              } else {
                
                // If no custom template is requested we use FirePHP templates
                // If data is a string just use a simple text renderer

                var rep = FirebugReps.PHPVariable;
                var firePHPRep = FirePHP.getRep(Data);
                if(firePHPRep==FirebugReps.FirePHPString) {
                  rep = FirebugReps.FirePHPText;
                } else
                if(firePHPRep==FirebugReps.FirePHPBoolean) {
                  rep = firePHPRep;
                } else
                if(firePHPRep==FirebugReps.FirePHPNumber) {
                  rep = firePHPRep;
                }
  
                oo = Firebug.Console.logRow(function(object, row, rep)
                  {
                    return rep.tag.append({object: object, meta:Meta}, row);
                  }, Data, this.activeContext, TemplateName, rep, null, false);
                
//            	  oo = Firebug.Console.logFormatted([Data], this.activeContext, TemplateName, false, null);
              }
              FirePHP.isLoggingData = false;
              return oo;
						}
					}
				}();
			}
			
			var proecessor_context = {FirePHPProcessor: this.FirePHPProcessor,
										 Firebug: Firebug,
										 data: data,
                     wildfire: wildfire,
										 context: this.activeContext,
										 url: url};

      /* Check if the processor to be loaded is the current processor.
       * If it is we do not re-load the processor
       */
      
      if (this.FirePHPProcessor.sourceURL == mask &&
          this.FirePHPProcessor.initialized) {

        with (proecessor_context) {
          FirePHPProcessor.data = data;
          FirePHPProcessor.context = proecessor_context.context;

          try {
            eval(FirePHPProcessor.code);
            
            FirePHPProcessor.ProcessRequest(wildfire,url,data);
          } 
          catch (e) {
            Firebug.FirePHP.logWarning(['Error executing custom FirePHP processor!', e]);
          }
        }
        
      } else {

        FirePHPLib.ajax({
          type: 'GET',
          url: mask,
          success: function(ReturnData){
            with (proecessor_context) {
              FirePHPProcessor.sourceURL = mask;
              FirePHPProcessor.data = data;
              FirePHPProcessor.context = proecessor_context.context;
              FirePHPProcessor.code = ReturnData;
              
              try {
                eval(ReturnData);
                
                FirePHPProcessor._Init();
                FirePHPProcessor.ProcessRequest(wildfire,url,data);
              } 
              catch (e) {
                Firebug.FirePHP.logWarning(['Error executing custom FirePHP processor!', e]);
              }
            }
            
          },
          error: function(XMLHttpRequest){
            if (mask.substr(0, 9) == 'chrome://') {

              with (proecessor_context) {
                FirePHPProcessor.sourceURL = mask;
                FirePHPProcessor.data = data;
                FirePHPProcessor.context = proecessor_context.context;
                FirePHPProcessor.code = XMLHttpRequest.responseText;
                
                try {

                  eval(XMLHttpRequest.responseText);
                  
                  FirePHPProcessor._Init();
                  FirePHPProcessor.ProcessRequest(wildfire,url,data);
                } 
                catch (e) {
                  Firebug.FirePHP.logWarning(['Error executing default FirePHP processor!', e]);
                }
              }
              
            }
            else {
            
              this.logWarning('Error loading processor from: ' + mask);
              
            }
          }
        });
      }
		}
		
	},
  
  logWarning: function(args)
  {
	  return Firebug.Console.logFormatted(args, this.activeContext, 'warn', false, null);
  },
  
  visitWebsite: function(which)
  {
      if(which=='hq') {

        var url = firephpURLs[which];
        url += "?Trigger=User";
        openNewTab(url);

      } else {
  
        openNewTab(firephpURLs[which]);
      }
  },

  
  openAboutDialog: function()
  {
      var extensionManager = CCSV("@mozilla.org/extensions/manager;1", "nsIExtensionManager");
      openDialog("chrome://mozapps/content/extensions/about.xul", "",
          "chrome,centerscreen,modal", "urn:mozilla:item:FirePHPExtension-Build@firephp.org", extensionManager.datasource);
  },
  
  onOptionsShowing: function(popup)
  {
      for (var child = popup.firstChild; child; child = child.nextSibling)
      {
          if (child.localName == "menuitem")
          {
              var option = child.getAttribute("option");
              if (option)
              {
                  if(option=='enabled') {
                    var checked = FirePHP.getPref(FirePHP.prefDomain, option);
                    child.setAttribute("checked", checked);
                  }
              }
          }
      }
  },
  
  onToggleOption: function(menuitem)
  {
      var option = menuitem.getAttribute("option");
      var checked = menuitem.getAttribute("checked") == "true";

      FirePHP.setPref(FirePHP.prefDomain, option, checked);
      
      if(option=="enabled" && checked) {
        
        if (FB_NEW && Firebug.FirePHP.activeContext) {
          
          if(!Firebug.NetMonitor.isEnabled(Firebug.FirePHP.activeContext) ||
             !Firebug.Console.isEnabled(Firebug.FirePHP.activeContext)) {
                
            alert('You must have the Firebug Console and Net panels enabled to use FirePHP!');                
          }
        }
      }
  },

  openPermissions: function()
  {
    var params = {
        permissionType: "firephp",
        windowTitle: "FirePHP Allowed Sites",
        introText: "Choose which web sites are allowed to load custom functionality into FirePHP.",
        blockVisible: true, sessionVisible: false, allowVisible: true, prefilledHost: ""
    };

    openWindow("Browser:Permissions", "chrome://browser/content/preferences/permissions.xul",'', params);
  }
  
    		   
});



/*
 * Monitor all requests so we can parse the response header data.
 */


function FirePHPProgress(context)
{
    this.context = context;
}



FirePHPProgress.prototype =
{
  
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // nsISupports

    QueryInterface: function(iid)
    {
        if (iid.equals(nsIWebProgressListener)
            || iid.equals(nsISupportsWeakReference)
            || iid.equals(nsISupports))
        {
            return this;
        }

        throw Components.results.NS_NOINTERFACE;
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // nsIObserver


    observe: function(request, topic, data)
    {
      if (!FB_NEW) {
      
        request = QI(request, nsIHttpChannel);
        
        if (this.context == Firebug.FirePHP.activeContext &&
        FirebugChrome.isFocused()) {
        
          Firebug.FirePHP.processRequest(request);
        }
      }
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // nsIWebProgressListener

    onStateChange: function(progress, request, flag, status)
    {
      if (!FB_NEW) {
      
        if (flag & STATE_TRANSFERRING && flag & STATE_IS_DOCUMENT) {
          var win = progress.DOMWindow;
          if (win == win.parent) {
          
            if (FirebugChrome.isFocused()) {
            
              Firebug.FirePHP.queRequest(request);
            }
          }
        }
        else 
          if (flag & STATE_STOP && flag & STATE_IS_REQUEST) {
          }
      }
    },

    onProgressChange : function(progress, request, current, max, total, maxTotal)
    {
    },

    stateIsRequest: false,
    onLocationChange: function() {},
    onStatusChange : function() {},
    onSecurityChange : function() {},
    onLinkIconAvailable : function() {}
};



function monitorContext(context)
{
    if (!context.firephpProgress)
    {
        var listener = context.firephpProgress = new FirePHPProgress(context);

        context.browser.addProgressListener(listener, NOTIFY_ALL);

        observerService.addObserver(listener, "http-on-examine-response", false);
    }
}

function unmonitorContext(context)
{
    if (context.firephpProgress)
    {

        if (context.browser.docShell)
            context.browser.removeProgressListener(context.firephpProgress, NOTIFY_ALL);

        observerService.removeObserver(context.firephpProgress, "http-on-examine-response", false);

        delete context.firephpProgress;
    }
}

Firebug.registerModule(Firebug.FirePHP);

}});
    
