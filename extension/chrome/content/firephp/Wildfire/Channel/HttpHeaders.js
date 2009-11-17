        
Wildfire.Channel.HttpHeaders = function() {
  
  this.headerPrefix = 'x-wf-';
  
  this.protocols = new Array();

  this.protocol_ids = new Array();
  
  this.messages = new Array();
  
  this.messageReceived = function(Key, Value)
  {
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
  };
  
  this.allMessagesReceived = function() {

    /* Flush the messages to the protocol */
   
   for( var protocol_index in this.messages ) {
     
     var messages = this.messages[protocol_index];
     var protocol_uri = this.protocol_ids[protocol_index];
     var protocol = this.getProtocol(protocol_uri);
     
     for( var index in messages ) {
       protocol.receiveMessage(messages[index][0][1], messages[index][1]);
     }

     this.messages[protocol_index] = new Array();
   }
    
    for( var uri in this.protocols ) {
      this.protocols[uri].allMessagesReceived();
    }
  };
  
  this.getProtocol = function(URI) {
    if(!this.protocols[URI]) {
      this.protocols[URI] = this.initProtocol(URI);
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
