        
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
