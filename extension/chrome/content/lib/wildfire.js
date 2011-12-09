
define([
],
function()
{
	var Wildfire = {}

	Wildfire.Channel = {}
	Wildfire.Protocol = {}
	Wildfire.Plugin = {}

	Wildfire.Channel.HttpHeaders = function() {
	  
	  this.headerPrefix = 'x-wf-';
	  
	  this.protocols = new Array();

	  this.protocol_ids = new Array();
	  
	  this.messages = new Array();
	  
	  this.messageReceived = function(Key, Value)
	  {
	      try {
	      
	        Key = Key.toLowerCase();
	    
	        if(Key.substr(0,this.headerPrefix.length)==this.headerPrefix) {
	    
	          if(Key.substr(this.headerPrefix.length,9)=='protocol-') {
	            var id = parseInt(Key.substr(this.headerPrefix.length+9));
	            
	            this.protocol_ids[id] = Value;
	    
	          } else {
	            
	            var parsed_key = this.parseKey(Key);
	            
	            if(!this.messages[parsed_key[0]]) {
	              this.messages[parsed_key[0]] = new Array();
	            }
	            this.messages[parsed_key[0]].push([parsed_key,Value]);
	          }
	        }
	      } catch(e) {
	      }
	  };
	  
	  this.allMessagesReceived = function() {

	    /* Flush the messages to the protocol */
	   
	   for( var protocol_index in this.messages ) {
	     
	     try {
	         var messages = this.messages[protocol_index];
	         var protocol_uri = this.protocol_ids[protocol_index];
	                  
	         var protocol = this.getProtocol(protocol_uri);

	         if(protocol) {
	             for( var index in messages ) {
	               protocol.receiveMessage(messages[index][0][1], messages[index][1]);
	             }
	         }    
	         this.messages[protocol_index] = new Array();

	      } catch(e) {
	      }

	   }
	    
	    for( var uri in this.protocols ) {
	      this.protocols[uri].allMessagesReceived();
	    }
	  };
	  
	  this.getProtocol = function(URI) {
	    if(!this.protocols[URI]) {
	        var protocol = this.initProtocol(URI);
	        if(!protocol) {
	            return false;
	        }
	        this.protocols[URI] = protocol;
	    }
	    return this.protocols[URI];
	  };

	  this.initProtocol = function(URI) {    
	    switch(URI) {
	      case 'http://meta.wildfirehq.org/Protocol/JsonStream/0.1':
	        return new Wildfire.Protocol.JsonStream_0_1;
	      case 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2':
	        return new Wildfire.Protocol.JsonStream_0_2;
	    }
	    return false;
	  };
	   
	  this.parseKey = function(Key) {
	    
	    var index = Key.indexOf('-',this.headerPrefix.length);
	    var id = parseInt(Key.substr(this.headerPrefix.length,index-this.headerPrefix.length));

	    return [id,Key.substr(index+1)];
	  }; 
	  
	}	
	
	Wildfire.Protocol.JsonStream_0_1 = function() {

	  this.PROTOCOL_URI = 'http://meta.wildfirehq.org/Protocol/JsonStream/0.1';
	  
	  this.plugins = new Array();
	  this.plugin_ids = new Array();
	  this.messages = new Array();
	  this.structures = new Array();
	  
	  this.expectedMessageCount = 0;
	  this.expectedStructureIDs = new Array();
	  this.expectedPluginIDs = new Array();
	  
	  this.buffer = new Array();
	  this.messageCount = 0;
	  
	  
	  this.getURI = function()
	  {
	    return this.PROTOCOL_URI;
	  };

	  this.registerPlugin = function(Plugin) {
	    for( var index in this.plugins ) {
	      if(this.plugins==Plugin) {
	        return false;
	      }
	    }
	    this.plugins[Plugin.getURI()] = Plugin;
	    return true;
	  };

	  this.receiveMessage = function(Key, Data) {
	        
	    var key = this.parseKey(Key);
	      
	    if(key[0]=='structure') {
	      if(!this.structures[key[1]]) {
	        this.structures[key[1]] = Data;
	      }
	    } else
	    if(key[0]=='plugin') {

	      if(!this.plugin_ids[key[1]]) {
	        
	        // split plugin URI removing the version from the end
	        var index = Data.lastIndexOf('/');
	        var uri = Data.substring(0,index+1);
	        var version = Data.substring(index+1);

	        if(this.plugins) {
	          for( var plugin_uri in this.plugins ) {
	            if(this.plugins[plugin_uri].isPeerPluginSupported(uri,version)) {
	              
	              this.plugins[plugin_uri].addPeerPlugin(uri,version);
	              
	              this.plugin_ids[key[1]] = plugin_uri;
	              break;
	            }
	          }
	        }
	      }
	    } else
	    if(key[0]=='index') {

	      this.expectedMessageCount = Data;
	      
	    } else {

	      this.messages[key[2]] = [key[1],key[0],Data.substring(1,Data.length-1)];

	      this.expectedStructureIDs[''+key[0]] = true;
	      this.expectedPluginIDs[''+key[1]] = true;

	      this.messageCount++;
	    }
	    
	    // Once we have all messages received based on the message index
	    // we flush them to the plugins
	    
	    if(this.messages
	      && this.expectedMessageCount!=0
	      && this.messageCount==this.expectedMessageCount
	      && this.expectedStructureIDs.length == this.structures.length
	      && this.expectedPluginIDs.length == this.plugin_ids.length) {
	    
	      this.messages = this.sortMessages(this.messages);
	      
	      for( var index in this.messages ) {

	        var plugin = this.plugins[this.plugin_ids[this.messages[index][0]]];

	        if(this.messages[index][2].length==4998) {
	          
	          this.buffer.push(this.messages[index][2]);
	                      
	        } else
	        if(this.buffer.length>0) {

	          plugin.receivedMessage(index,
	                                 this.structures[this.messages[index][1]],
	                                 this.buffer.join('')+this.messages[index][2]);

	          this.buffer = new Array();
	        
	        } else {
	          plugin.receivedMessage(index,
	                                 this.structures[this.messages[index][1]],
	                                 this.messages[index][2]);
	        }
	      }
	      
	      this.messages = new Array();    
	    }
	     
	    return true;
	  };
	  
	  this.allMessagesReceived = function() {
	  };
	  
	  this.sortMessages = function(Messages) {
	    array = new Array();
	    var keys = new Array();
	    for(k in Messages)
	    {
	         keys.push(k);
	    }
	    
	    keys.sort( function (a, b) { 
	        return a - b;
	      }
	    );
	    
	    
	    for (var i = 0; i < keys.length; i++)
	    {
	      array[keys[i]] = Messages[keys[i]];
	    }    
	    return array;
	  }
	  
	  
	  this.parseKey = function(Key) {
	    return Key.toLowerCase().split('-');
	  };
	}	
	
    
	Wildfire.Protocol.JsonStream_0_2 = function() {

	  this.PROTOCOL_URI = 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2';
	  
	  this.plugins = new Array();
	  this.plugin_ids = new Array();
	  this.messages = new Array();
	  this.structures = new Array();
	  
	  this.expectedMessageCount = 0;
	  this.expectedStructureIDs = new Array();
	  this.expectedPluginIDs = new Array();
	  
	  this.buffer = new Array();
	  this.messageCount = 0;
	  
	  
	  this.getURI = function()
	  {
	    return this.PROTOCOL_URI;
	  };

	  this.registerPlugin = function(Plugin) {
	    for( var index in this.plugins ) {
	      if(this.plugins==Plugin) {
	        return false;
	      }
	    }
	    this.plugins[Plugin.getURI()] = Plugin;
	    return true;
	  };

	  this.receiveMessage = function(Key, Data) {
	        
	    var key = this.parseKey(Key);
	      
	    if(key[0]=='structure') {
	      if(!this.structures[key[1]]) {
	        this.structures[key[1]] = Data;
	      }
	    } else
	    if(key[0]=='plugin') {

	      if(!this.plugin_ids[key[1]]) {
	        
	        // split plugin URI removing the version from the end
	        var index = Data.lastIndexOf('/');
	        var uri = Data.substring(0,index+1);
	        var version = Data.substring(index+1);

	        if(this.plugins) {
	          for( var plugin_uri in this.plugins ) {
	            if(this.plugins[plugin_uri].isPeerPluginSupported(uri,version)) {
	              
	              this.plugins[plugin_uri].addPeerPlugin(uri,version);
	              
	              this.plugin_ids[key[1]] = plugin_uri;
	              break;
	            }
	          }
	        }
	      }
	    } else
	    if(key[0]=='index') {
	      
	      // Skip this for now
//	      this.expectedMessageCount = Data;
	      
	    } else {

	      this.messages[key[2]] = [key[1],key[0],Data];

	      this.expectedStructureIDs[''+key[0]] = true;
	      this.expectedPluginIDs[''+key[1]] = true;

	      this.messageCount++;
	    }
	     
	    return true;
	  };
	  
	  this.allMessagesReceived = function() {

	    // Once we have all messages received based on the message index
	    // we flush them to the plugins

	    if(this.messages
//	      && this.expectedMessageCount!=0
//	      && this.messageCount==this.expectedMessageCount
	      && this.expectedStructureIDs.length == this.structures.length
	      && this.expectedPluginIDs.length == this.plugin_ids.length) {
	    
	      this.messages = this.sortMessages(this.messages);
	      
	      for( var index in this.messages ) {

	        var plugin = this.plugins[this.plugin_ids[this.messages[index][0]]];

	        var m = this.messages[index][2].match(/^(\d*)?\|(.*)\|(\\)?$/);

	        // length present and message matches length - complete message
	        if(m[1] && m[1]==m[2].length && !m[3]) {
	  
	          plugin.receivedMessage(index,
	                                 this.structures[this.messages[index][1]],
	                                 m[2]);
	        } else
	        // message continuation present - message part
	        if( m[3] ) {

	          this.buffer.push(m[2]);
	            
	        } else
	        // no length and no message continuation - last message part
	        if( !m[1] && !m[3] ) {

	          plugin.receivedMessage(index,
	                                 this.structures[this.messages[index][1]],
	                                 this.buffer.join('')+m[2]);

	          this.buffer = new Array();
	        
	        } else {
	          // We should be here!
	          dump('WARNING: 9937'+"\n");
	        }
	      }
	      
	      this.messages = new Array();    
	    }    
	  };
	  
	  this.sortMessages = function(Messages) {
	    array = new Array();
	    var keys = new Array();
	    for(k in Messages)
	    {
	         keys.push(k);
	    }
	    
	    keys.sort( function (a, b) { 
	        return a - b;
	      }
	    );
	    
	    
	    for (var i = 0; i < keys.length; i++)
	    {
	      array[keys[i]] = Messages[keys[i]];
	    }    
	    return array;
	  }
	  
	  
	  this.parseKey = function(Key) {
	    return Key.toLowerCase().split('-');
	  };
	}
    
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

	  
	  this.channel = new Wildfire.Channel.HttpHeaders();

	  this.messages = new Array();


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
	    
	    for( var index in this.messages ) {
	      if(this.messages[index][1]==StructureURI) {
	        messages.push(this.messages[index][2]);
	      }
	    }

	    return messages;
	  };
	  
	}
	
	return Wildfire;
});
