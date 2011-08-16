        
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
//      this.expectedMessageCount = Data;
      
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
//      && this.expectedMessageCount!=0
//      && this.messageCount==this.expectedMessageCount
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
