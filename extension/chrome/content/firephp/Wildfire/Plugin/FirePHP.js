        
Wildfire.Plugin.FirePHP = function() {
  

  this.PLUGINL_URI = 'http://meta.firephp.org/Wildfire/Plugin/FirePHP/FirefoxExtension/0.1';
  this.STRUCTURE_URI_DUMP = 'http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1';
  this.STRUCTURE_URI_FIREBUGCONSOLE = 'http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1';

  this.supportedPlugins =
      {
          'http://meta.firephp.org/Wildfire/Plugin/ZendFramework/FirePHP/':
              {version: '1.6.2'},
          'http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/':
              {version: '0.2.0'}
      }
      
  this.peerPlugins = new Array();

  
  this.channel = new Wildfire.Channel.HttpHeaders;

  this.messages = new Array();
  
  this.callbackMessageIsReady = {};


  this.init = function() {
  
    this.channel.getProtocol('http://meta.wildfirehq.org/Protocol/JsonStream/0.1').registerPlugin(this);
    this.channel.getProtocol('http://meta.wildfirehq.org/Protocol/JsonStream/0.2').registerPlugin(this);

  };

  this.getURI = function()
  {
    return this.PLUGINL_URI;
  };
  this.isPeerPluginSupported = function(uri, version)
  {
      if(!this.supportedPlugins[uri]) {
          return false;
      }
      
      return true;
  };
  this.addPeerPlugin = function(uri, version)
  {
      var info = this.supportedPlugins[uri];
      
      if(this.peerPlugins) {
          for( var i in this.peerPlugins ) {
            if(this.peerPlugins[i].uri==uri
               && this.peerPlugins[i].version==version) {
              
              return false;                 
            }
          }
      }
      
      this.peerPlugins.push({uri:uri,version:version,minVersion: info.version});
      
      return true;
  }
  this.getPeerPlugins = function()
  {
      return this.peerPlugins;
  }
  
  this.receivedMessage = function(Index, Structure, Message) {
    
    this.messages.push([Index,Structure,Message]);
  };
  
  this.hasMessages = function() {
    return (this.messages.length>0)?true:false;
  };
  
  this.getMessages = function(StructureURI) {
    
    var messages = new Array();
    
    var message_tmp;

    for( var index in this.messages ) {
      if(this.messages[index][1]==StructureURI) {
        message_tmp = this.messages[index][2];
        if(this.channel.getOption('gzip')) {
           //use callback onMessageIsReady
           this._gzip_decode(StructureURI, message_tmp);
        } else {
           messages.push(message_tmp);
        }
      }
    }

    return messages;
  };
  
  this.addListenerOnMessageIsReady = function(StructureURI, listener, context) {
    this.callbackMessageIsReady[StructureURI] = [listener, context];
  };
  
  this._gzip_decode = function (StructureURI, s) { // Decompress an LZW-encoded string
      var StreamListener = function(callback, context) {
        this.data = [];
        this.callbackOnReady = callback;
        this.callbackContext = context;
      };
      
      StreamListener.prototype = {
         onDataAvailable : function(request, context, inputStream, offset, count)
         {
           var scriptable = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
           scriptable.init(inputStream);
           this.data.push(scriptable.read(inputStream.available()));
         },

         onStartRequest : function(request, context)   
         {
           this.data = [];
         },

         onStopRequest : function(request, context)
         {
           this.callbackOnReady.call(this.callbackContext, this.getData());
         },
         
         getData : function() {
           return(this.data.join(''));
         },
         
      };

      //listener for the converted data
      var listener;
      if(this.callbackMessageIsReady[StructureURI] && typeof(this.callbackMessageIsReady[StructureURI][0]) == 'function') {
      	listener = new StreamListener(this.callbackMessageIsReady[StructureURI][0], this.callbackMessageIsReady[StructureURI][1]);
      } else {
        listener = new StreamListener(function() {}, this);
      }


      var ioService = Components.classes["@mozilla.org/network/io-service;1"]  
	                  .getService(Components.interfaces.nsIIOService);  

      var uri = ioService.newURI("data:gzip;base64," + s, null, null);  
      
      var chan = ioService.newChannelFromURI(uri);

      var request = chan.QueryInterface(Components.interfaces.nsIRequest);

            // Attempt to gunzip
            
      var converterService = Components.classes["@mozilla.org/streamConverters;1"]
            .getService(Components.interfaces.nsIStreamConverterService);
        
     // Instantiate our gzip decompresser converter
      var converterStreamListener = converterService.asyncConvertData("gzip",
            "uncompressed", listener, null);
            

      chan.asyncOpen(converterStreamListener, this);
      
  };
  
}