/* ***** BEGIN LICENSE BLOCK *****
 * 
 * This software is distributed under the New BSD License.
 * See LICENSE file for terms of use.
 * 
 * ***** END LICENSE BLOCK ***** */


var FirePHPLib = top.FirePHPLib = {


 
 
  ajax: function(args) {
    
    var ajaxArgs = args;

    var client = new XMLHttpRequest();
    client.open(ajaxArgs.type, ajaxArgs.url, true);
    client.onreadystatechange = function(event) {
       if(client.readyState == 4 && client.status == 200) {
         
         ajaxArgs.success(client.responseText);
       
       } else if (client.readyState == 4 && client.status != 200) {

         ajaxArgs.error(client);

       }
    };
		try {
      client.overrideMimeType('text/plain; charset=us-ascii');
      client.setRequestHeader("Accept", "text/plain" + ", */*");
		} catch(e){}
    client.send(null);
  },

 isArray: function(obj) {
     if (obj.constructor.toString().indexOf("Array") == -1)
        return false;
     else
        return true;
  },

  createMenuItem: function(popup, item) {
    
    var menuitem = popup.ownerDocument.createElement("menuitem");

    var label = item.label;
    
    menuitem.setAttribute("label", label);
    menuitem.setAttribute("type", item.type);
    menuitem.setAttribute("value", item.value);
    if (item.checked)
        menuitem.setAttribute("checked", "true");
    if (item.disabled)
        menuitem.setAttribute("disabled", "true");
    
    if (item.command)
        menuitem.addEventListener("command", item.command, false);

    popup.appendChild(menuitem);
    return menuitem;
  },

  
  extend: function(l, r) {
    var newOb = {};
    for (var n in l)
        newOb[n] = l[n];
    for (var n in r)
        newOb[n] = r[n];
    return newOb;
  },
  
  bindFixed: function() {
      var args = cloneArray(arguments), fn = args.shift(), object = args.shift();
      return function() { return fn.apply(object, args); }
  },
	  
	  
	removeKey: function(list, key) {
    /* TODO: Try and figure out a way to do this by reference */
		var new_list = Array();
		for( var item in list ) {
	  	if(item == key) {
	    	/* Don't add element to new array */
	    } else {
	    	new_list[item] = list[item];
	    }
	  }
	  return new_list;
	},
  
  getXMLTreeNodeAttributes: function(Node) {
  	var attributes = new Array();
  	for( var name in Node ) {
  		if(name.substring(0,1)=='-') {
  			attributes[name.substring(1)] = Node[name];
  		}
  	}
  	return attributes;
  },
  
  
  isVersionNewer: function(version1, version2) {

    if(version1==version2) {
      return false;
    }

    var version1_split = version1.split('.');
    var version2_split = version2.split('.');
    
    if(version1_split[0]<version2_split[0]) {
      return false;
    }

    if(version1_split.length==1 && version2_split.length==2 ||
      version1_split[1]<version2_split[1]) {
      return false;
    }
    if(version1_split.length==2 && version2_split.length==3 ||
      version1_split[2]<version2_split[2]) {
      return false;
    }
    if(version1_split.length==3 && version2_split.length==4 ||
      version1_split[3]<version2_split[3]) {
      return false;
    }

    return true;    
  },
  
	
	sortSecondByFirstNumeric: function(keys,values) {

		var decisions = [];

		/* Sort the keys and remember the decisions */
		keys.sort( function (a,b) {
			decisions[decisions.length] = a-b;
			return a-b; 
		});

		/* Now sort the values based on the decisions */
		var index = 0;
		values.sort( function (a,b) {
			index++;
			return decisions[index-1];
		});
		
		return values;
	},
	
	
  /* Prints the given object to the console */
  dump: function(Object,Name,Filter,IncludeValues) {
    dump('Var: '+Name+' ['+Object+']'+"\n");
    if(!Object) return;
    
    var list = new Array();
    for( var name in Object ) {
    
      if(Filter) {
        if(name.substring(0,Filter.length)==Filter) {
          list[list.length] = name;
        }
      } else {
        list[list.length] = name;
      }
    }
    
    if(!list) return;    
    
    list.sort();

    dump(' {'+"\n");
    
    for( var name in list ) {
      if(IncludeValues) {
        dump('  '+list[name]+' = '+Object[list[name]]+"\n");
      } else {
        dump('  '+list[name]+"\n");
      }
    }
    dump(' }'+"\n");
  },
  
  
getProtocol: function(url)
{
    var m = /([^:]+):\/{1,3}/.exec(url);
    return m ? m[1] : "";
},
	
	
  
/**
*
*  URL encode / decode
*  http://www.webtoolkit.info/
*
**/  
	urlEncode : function (string) {
		return escape(this._utf8_encode(string));
	},

	urlDecode : function (string) {
		return this._utf8_decode(unescape(string));
	},

	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c==43) {
				string += ' ';
				i++;
			} else
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	} ,
	
	
	renderJSONString: function(arr,level) {
			
		/**
		* Function : dump()
		* Arguments: The data - array,hash(associative array),object
		*    The level - OPTIONAL
		* Returns  : The textual representation of the array.
		* This function was inspired by the print_r function of PHP.
		* This will accept some data as the argument and return a
		* text that will be a more readable version of the
		* array/hash/object that is given.
		*/
		var dumped_text = "";
		if(!level) level = 0;
		
		/* The padding given at the beginning of the line. */
		var level_padding = "";
		for(var j=0;j<level+1;j++) level_padding += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		
		if(typeof(arr) == 'object') { /* Array/Hashes/Objects */
		 for(var item in arr) {
		  var value = arr[item];
		 
		  if(typeof(value) == 'object') { /* If it is an array */
		   dumped_text += level_padding + "'" + item + "' ...<br>";
		   dumped_text += FirePHPLib.renderJSONString(value,level+1);
		  } else {
		   dumped_text += level_padding + "'" + item + "' => \"" + value + "\"<br>";
		  }
		 }
		} else { /* Stings/Chars/Numbers etc. */
		 dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
		}
		return dumped_text;
		} 
  
  
}
