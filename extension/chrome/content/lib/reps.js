
define([
    "firebug/firefox/window",
	"firebug/lib/domplate",
	"firebug/lib/dom",
	"firebug/lib/css",
	"firebug/lib/events"
],
function(WINDOW, DOMPLATE, DOM, CSS, EVENTS)
{
	return {
		init: function(renderer)
		{
			with(DOMPLATE)
			{
				// ************************************************************************************************
				var OBJECTBOX = this.OBJECTBOX =
				    SPAN({class: "objectBox objectBox-$className"});
	
				var OBJECTLINK = this.OBJECTLINK =
				    A({
				        class: "objectLink objectLink-$className",
				        _repObject: "$object",
				        onmouseover:"$onMouseOver",
				        onmouseout:"$onMouseOut",
				        onclick:"$onClick"
				    });
	
	
				FirebugReps.PHPVariable = domplate(Firebug.Rep,
				{
				    className: "object",
				    
				    pinInspector: false,
	
				    tag:
				      SPAN({class: "firephp-row-label",
				            _repInObject: "$__in__",
				            onmouseover:"$onMouseOver2",
				            onmouseout:"$onMouseOut2"}, '$__in__|getLabel',
				        A({
				            class: "objectLink-PHPVariable",
				            _repObject: "$object",
				            _repInObject: "$__in__",
				            onmouseover:"$onMouseOver",
				            onmouseout:"$onMouseOut",
				            onclick:"$onClick"
				          },
				          SPAN({class: "objectTitle"},
				            TAG("$object|getTag", {object: "$object"})
				          )
				        )
				      ),
				    
				    getLabel: function(row) {
				      if(row && row.meta && row.meta.Label) {
				        return row.meta.Label + ': ';
				      }
				      return ' ';
				    },
				    
				    onMouseOver: function(event) {
				      
				      this.pinInspector = false;
	
				      renderer.firephp.viewer.show(event.currentTarget.repObject);
				    },
				    
				    onMouseOut: function() {
	
				      if(this.pinInspector) return;
				      
				      renderer.firephp.viewer.hide();
				    },    
				    
				    onMouseOver2: function(event) {
				      
				      if(event.currentTarget.repInObject.meta
				         && event.currentTarget.repInObject.meta.File
				         && event.currentTarget.repInObject.meta.Line) {
	
				    	  renderer.firephp.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
				          + ' : '
				          + event.currentTarget.repInObject.meta.Line);
				      }
				    },
				    
				    onMouseOut2: function() {
	
				    	renderer.firephp.setWindowStatusBarText(null);
				    },
				    
				    onClick: function(event) {
	
				      this.pinInspector = true;
				      
				      renderer.firephp.viewer.show(event.currentTarget.repObject,true);
				    },
	
				    
				    getTag: function(object) {
				      var rep = renderer.getRep(object);
				      var tag = rep.shortTag ? rep.shortTag : rep.tag;
				      
				      return tag;
				    },
				    
				    getTitle: function(object) {
				      
				      if (object.constructor.toString().indexOf("Array") != -1 ||
				          object.constructor.toString().indexOf("Object") != -1) {
	
				        var count = 0;
				        for (var key in object) {
				          count++;
				        }
	
				        return 'Array('+count+')';
				      
				      } else {
				        return object;
				      }      
				    },
				    
				    supportsObject: function(object, type)
				    {
				        return false;
				    }    
				});
	
	
	
				FirebugReps.FirePHPMore = domplate(Firebug.Rep,
				{
				    className: "firephp-more",
				  
				    tag: OBJECTBOX(" ... ")
				});
	
	
				FirebugReps.FirePHPArr = domplate(Firebug.Rep,
				{
				    pinInspector: false,
				  
				    tag:
				        OBJECTBOX(
				            SPAN("array("),        
				            FOR("item", "$object|propIterator",
				                TAG("$item.nameTag", {object: "$item.nameObject"}),
				                SPAN("=>"),
				                TAG("$item.valueTag", {object: "$item.valueObject"}),
				                
				                SPAN({class: "arrayComma"}, "$item.delim")
				            ),
				            SPAN(")")
				        ),
	
				    propIterator: function (object)
				    {
				        if (!object)
				            return [];
	
				        var props = [];
				        var len = 0;
	
				        try
				        {
				            var i = 0;
				            for (var name in object)
				            {
				                var val;
				                try
				                {
				                    val = object[name];
				                }
				                catch (exc)
				                {
				                    continue;
				                }
	
				                var nameRep = renderer.getRep(name);
				                var nameTag = nameRep.shortTag ? nameRep.shortTag : nameRep.tag;
				    
				                
				                var valueRep = renderer.getRep(val);
				                if(i>=2) {
				                  valueRep = FirebugReps.FirePHPMore;
				                }
				                
				                var valueTag = valueRep.shortTag ? valueRep.shortTag : valueRep.tag;
				    
				                props.push({nameObject: name, nameTag: nameTag,
				                            valueObject: val, valueTag: valueTag, delim: ', '});
				       
				                if(i>=2) {
				                  break;                  
				                }
				               
				               i++;
				            }
				            
				            props[props.length-1].delim = '';
				        }
				        catch (exc)
				        {
				            // Sometimes we get exceptions when trying to read from certain objects, like
				            // StorageList, but don't let that gum up the works
				            // XXXjjb also History.previous fails because object is a web-page object which does not have
				            // permission to read the history
				        }
	
				        return props;
				    },
	
				    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	
				    className: "firephp-array",
	
				    supportsObject: function(object, type)
				    {
				        return true;
				    }
				});
	
	
				FirebugReps.FirePHPClass = domplate(Firebug.Rep,
				{
				    pinInspector: false,
				  
				    tag:
				        OBJECTBOX(
				            SPAN("$object|getClassName("),
				            SPAN({class: "props"},      
				            FOR("item", "$object|propIterator",
				                TAG("$item.nameTag", {object: "$item.nameObject"}),
				                SPAN("=>"),
				                TAG("$item.valueTag", {object: "$item.valueObject"}),
				                
				                SPAN({class: "arrayComma"}, "$item.delim")
				            )
				            ),
				            SPAN(")")
				        ),
	
	
				    getClassName: function(object) {
				      return object['__className'];
				    },
	
				    propIterator: function (object)
				    {
				        if (!object)
				            return [];
	
				        var props = [];
				        var len = 0;
	
				        try
				        {
				            var i = 0;
				            for (var name in object)
				            {
				                if(name!='__className') {
				                
				                  var val;
				                  try
				                  {
				                      val = object[name];
				                  }
				                  catch (exc)
				                  {
				                      continue;
				                  }
				  
				                  var nameRep = renderer.getRep(name);
				                  var nameTag = nameRep.shortTag ? nameRep.shortTag : nameRep.tag;
				      
				                  var valueRep = renderer.getRep(val);
				                  if(i>=2) {
				                    valueRep = FirebugReps.FirePHPMore;
				                  }
				                  
				                  var valueTag = valueRep.shortTag ? valueRep.shortTag : valueRep.tag;
				      
				                  var elementName = name;
				                  var index  = elementName.lastIndexOf(':');
				                  if(index!=-1) {
				                    elementName = elementName.substr(index+1);
				                  }      
	
				                  props.push({nameObject: elementName, nameTag: nameTag,
				                              valueObject: val, valueTag: valueTag, delim: ', '});
				                      
				                  if(i>=2) {
				                    break;
				                  }        
				                  i++;
				              }
				            }
				            
				            props[props.length-1].delim = '';
				        }
				        catch (exc)
				        {
				            // Sometimes we get exceptions when trying to read from certain objects, like
				            // StorageList, but don't let that gum up the works
				            // XXXjjb also History.previous fails because object is a web-page object which does not have
				            // permission to read the history
				        }
	
				        return props;
				    },
	
	
				    onMouseOver: function(event) {
				      
				      this.pinInspector = false;
	
				      renderer.firephp.viewer.show(event.currentTarget.repObject);
				    },
				    
				    onMouseOut: function() {
	
				      if(this.pinInspector) return;
				      
				      renderer.firephp.viewer.hide();
				    },
	
				    onClick: function(event) {
	
				      this.pinInspector = true;
				      
				      renderer.firephp.viewer.show(event.currentTarget.repObject,true);
				    },
	
				    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	
				    className: "firephp-class",
	
				    supportsObject: function(object, type)
				    {
				        if(type=="object" && object['__className']) return true;
				    }
				});
	
	
	
				FirebugReps.FirePHPString = domplate(Firebug.Rep,
				{
				    tag: OBJECTBOX("'$object'"),
	
				    shortTag: OBJECTBOX("'$object|cropString'"),
	
				    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	
				    className: "string",
	
				    supportsObject: function(object, type)
				    {
				        return type == "string";
				    },
				    
				    cropString: function(text)
				    {
				        var limit = 50;
				    
				        if (text.length > limit)
				            return this.escapeNewLines(text.substr(0, limit/2) + "..." + text.substr(text.length-limit/2));
				        else
				            return this.escapeNewLines(text);
				    },
	
				    escapeNewLines: function(value)
				    {
				        return value.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
				    }
				});
	
				FirebugReps.FirePHPText = domplate(Firebug.Rep,
				{
				    tag: SPAN({class: "firephp-row-label",
				            _repInObject: "$__in__",
				            onmouseover:"$onMouseOver",
				            onmouseout:"$onMouseOut"}, '$__in__|getLabel',OBJECTBOX("$object")),
				    
				    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	
				    className: "firephp-text",
				    
				    getLabel: function(row) {
				      if(row && row.meta && row.meta.Label) {
				        return row.meta.Label + ': ';
				      }
				      return ' ';
				    },
	
				    onMouseOver: function(event) {
				      
				      if(event.currentTarget.repInObject.meta
				         && event.currentTarget.repInObject.meta.File
				         && event.currentTarget.repInObject.meta.Line) {
	
				    	  renderer.firephp.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
				          + ' : '
				          + event.currentTarget.repInObject.meta.Line);
				      }
				    },
				    
				    onMouseOut: function() {
				    	renderer.firephp.setWindowStatusBarText(null);
				    }
				});
	
				FirebugReps.FirePHPBoolean = domplate(Firebug.Rep,
				{
				    tag: SPAN({class: "firephp-row-label",
				            _repInObject: "$__in__",
				            onmouseover:"$onMouseOver",
				            onmouseout:"$onMouseOut"}, '$__in__|getLabel',OBJECTBOX("$object|toUpperCase")),
	
				    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	
				    className: "firephp-boolean",
				    
				    toUpperCase: function(value) {
				      var val = new String(value);
				      return val.toUpperCase();
				    },
	
				    supportsObject: function(object, type)
				    {
				        return type == "boolean" || (type=="object" && object==null);
				    },
				    
				    getLabel: function(row) {
				      if(row && row.meta && row.meta.Label) {
				        return row.meta.Label + ': ';
				      }
				      return ' ';
				    },
	
				    onMouseOver: function(event) {
				      
				      if(event.currentTarget.repInObject.meta
				         && event.currentTarget.repInObject.meta.File
				         && event.currentTarget.repInObject.meta.Line) {
	
				    	  renderer.firephp.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
				          + ' : '
				          + event.currentTarget.repInObject.meta.Line);
				      }
				    },
				    
				    onMouseOut: function() {
				    	renderer.firephp.setWindowStatusBarText(null);
				    }
				});
	
				FirebugReps.FirePHPNumber = domplate(Firebug.Rep,
				{
				    tag: SPAN({class: "firephp-row-label",
				            _repInObject: "$__in__",
				            onmouseover:"$onMouseOver",
				            onmouseout:"$onMouseOut"}, '$__in__|getLabel',OBJECTBOX("$object")),
	
				    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	
				    className: "firephp-number",
	
				    supportsObject: function(object, type)
				    {
				        return type == "number";
				    },
				    
				    getLabel: function(row) {
				      if(row && row.meta && row.meta.Label) {
				        return row.meta.Label + ': ';
				      }
				      return ' ';
				    },
	
				    onMouseOver: function(event) {
				      
				      if(event.currentTarget.repInObject.meta
				         && event.currentTarget.repInObject.meta.File
				         && event.currentTarget.repInObject.meta.Line) {
	
				    	  renderer.firephp.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
				          + ' : '
				          + event.currentTarget.repInObject.meta.Line);
				      }
				    },
				    
				    onMouseOut: function() {
				    	renderer.firephp.setWindowStatusBarText(null);
				    }
				});
	
	
				// ************************************************************************************************
	
				renderer.setDefaultRep(FirebugReps.FirePHPArr);
	
				renderer.registerRep(
	//			    FirebugReps.PHPVariable,
	//			    FirebugReps.FirePHPArray,
				    FirebugReps.FirePHPClass,
				    FirebugReps.FirePHPBoolean,
				    FirebugReps.FirePHPNumber,
				    FirebugReps.FirePHPString
				);
	        	
	            
	            function getTraceTemplate(renderer)
	            {
        	        return domplate(Firebug.Rep, {
        	          tag: DIV({
        	            class: "head",
        	            _repObject: "$object"
        	          }, A({
        	            class: "title",
        	            onclick: "$onToggleBody",
        	                _repInObject: "$__in__",
        	                onmouseover:"$onMouseOver",
        	                onmouseout:"$onMouseOut"
        	          }, "$object|getCaption")),
        	          
        	          infoTag: DIV({
        	            class: "info"
        	          }, TABLE({
        	            cellpadding: 3,
        	            cellspacing: 0
        	          }, TBODY(TR(TD({
        	            class: 'headerFile'
        	          }, 'File'), TD({
        	            class: 'headerLine'
        	          }, 'Line'), TD({
        	            class: 'headerInst'
        	          }, 'Instruction')), FOR("call", "$object|getCallList", TR({}, TD({
        	            class: 'cellFile'
        	          }, DIV({}, "$call.file")), TD({
        	            class: 'cellLine'
        	          }, DIV({}, "$call.line")), TD({
        	            class: 'cellInst'
        	          }, DIV({}, "$call|getCallLabel(", FOR("arg", "$call|argIterator", TAG("$arg.tag", {
        	            object: "$arg.value"
        	          }), SPAN({
        	            class: "arrayComma"
        	          }, "$arg.delim")), ")"))))))),
        	      
        	         
        	        onMouseOver: function(event) {
        	          
        	          if(event.currentTarget.repInObject.meta
        	             && event.currentTarget.repInObject.meta.File
        	             && event.currentTarget.repInObject.meta.Line) {
        	
        	        	  renderer.firephp.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
        	              + ' : '
        	              + event.currentTarget.repInObject.meta.Line);
        	          }
        	        },
        	
        	        onMouseOut: function() {
        	
        	        	renderer.firephp.setWindowStatusBarText(null);
        	        },    
        	        
        	              
        	          getCaption: function(item){
        	            if (item.Class && item.Type == 'throw') {
        	              return item.Class + ': ' + item.Message;
        	            } else
        	            if (item.Class && item.Type == 'trigger') {
        	              return item.Message;
        	            }
        	            else {
        	              return item.Message;
        	            }
        	          },
        	          
        	          onToggleBody: function(event){
        	            var target = event.currentTarget;
        	            var logRow = DOM.getAncestorByClass(target, 'logRow-'+this.className);
        	            if (EVENTS.isLeftClick(event)) {
        	              CSS.toggleClass(logRow, "opened");
        	              
        	              if (CSS.hasClass(logRow, "opened")) {
        	              
        	                /* Lets only render the stack trace once we request it */
        	                if (!DOM.getChildByClass(logRow, "head", "info")) {
        	                  this.infoTag.append({
        	                    'object': DOM.getChildByClass(logRow, "head").repObject
        	                  }, DOM.getChildByClass(logRow, "head"));
        	                }
        	              }
        	            }
        	          },
        	          
        	          getCallList: function(call){
        	            var list = call.Trace;
        	            list.unshift({
        	              'file': call.File,
        	              'line': call.Line,
        	              'class': call.Class,
        	              'function': call.Function,
        	              'type': call.Type,
        	              'args': call.Args
        	            });
        	            /* Now that we have all call events, lets sew if we can shorten the filename.
        	           * This only works for unif filepaths for now.
        	           * TODO: Get this working for windows filepaths as well.
        	           */
        	            try {
        	              if (list[0].file.substr(0, 1) == '/') {
        	                var file_shortest = list[0].file.split('/');
        	                var file_original_length = file_shortest.length;
        	                for (var i = 1; i < list.length; i++) {
        	                  var file = list[i].file.split('/');
        	                  for (var j = 0; j < file_shortest.length; j++) {
        	                    if (file_shortest[j] != file[j]) {
        	                      file_shortest.splice(j, file_shortest.length - j);
        	                      break;
        	                    }
        	                  }
        	                }
        	                if (file_shortest.length > 2) {
        	                  if (file_shortest.length == file_original_length) {
        	                    file_shortest.pop();
        	                  }
        	                  file_shortest = file_shortest.join('/');
        	                  for (var i = 0; i < list.length; i++) {
        	                    list[i].file = '...' + list[i].file.substr(file_shortest.length);
        	                  }
        	                }
        	              }
        	            } 
        	            catch (e) {
        	            }
        	            return list;
        	          },
        	          
        	          getCallLabel: function(call){
        	            if (call['class']) {
        	              if (call['type'] == 'throw') {
        	                return 'throw ' + call['class'];
        	              } else
        	              if (call['type'] == 'trigger') {
        	                return 'trigger_error';
        	              }
        	              else {
        	                return call['class'] + call['type'] + call['function'];
        	              }
        	            }
        	            return call['function'];
        	          },
        	          
        	          argIterator: function(call){
        	            if (!call.args) 
        	              return [];
        	            var items = [];
        	            for (var i = 0; i < call.args.length; ++i) {
        	              var arg = call.args[i];
        	              
        	//              var rep = FirePHP.getRep(arg);
        	//              var tag = rep.shortTag ? rep.shortTag : rep.tag;
        	                    var rep = FirebugReps.PHPVariable;
        	                    var tag = rep.tag;
        	              
        	    /*          
        	              if(!arg) {
        	                var rep = Firebug.getRep(arg);
        	                var tag = rep.shortTag ? rep.shortTag : rep.tag;
        	              } else
        	              if (arg.constructor.toString().indexOf("Array") != -1 ||
        	                  arg.constructor.toString().indexOf("Object") != -1) {
        	                var rep = FirebugReps.PHPVariable;
        	                var tag = rep.tag;
        	              }
        	              else {
        	                var rep = Firebug.getRep(arg);
        	                var tag = rep.shortTag ? rep.shortTag : rep.tag;
        	              }
        	    */          
        	              var delim = (i == call.args.length - 1 ? "" : ", ");
        	              items.push({
        	                name: 'arg' + i,
        	                value: arg,
        	                tag: tag,
        	                delim: delim
        	              });
        	            }
        	            return items;
        	          }
        	          
        	        });
	            }
	            
	            function getTableTemplate(renderer)
	            {
        	    	return domplate(Firebug.Rep,
        	        {
        	          className: 'firephp-table',
        	          tag:
        	              DIV({class: "head", _repObject: "$object", _repMeta: "$meta"},
        	                  A({class: "title", onclick: "$onToggleBody",
        	                _repInObject: "$__in__",
        	                onmouseover:"$onMouseOver",
        	                onmouseout:"$onMouseOut"}, "$__in__|getCaption")
        	              ),
        	        
        	          infoTag: DIV({class: "info"},
        	                 TABLE({cellpadding: 3, cellspacing: 0},
        	                  TBODY(
        	                    TR(
        	                      FOR("column", "$__in__|getHeaderColumns",
        	                        TD({class:'header'},'$column')
        	                      )
        	                    ),
        	                    FOR("row", "$__in__|getRows",
        	                        TR({},
        	                          FOR("column", "$row|getColumns",
        	                            TD({class:'cell'},
        	                              TAG("$column.tag", {object: "$column.value"})
        	                            )
        	                          )
        	                        )
        	                      )
        	                    )
        	                  )
        	                 ),
        	                      
        	               
        	        onMouseOver: function(event) {
        	
        	          if(event.currentTarget.repInObject.meta
        	             && event.currentTarget.repInObject.meta.File
        	             && event.currentTarget.repInObject.meta.Line) {
        	
        	        	  renderer.firephp.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
        	              + ' : '
        	              + event.currentTarget.repInObject.meta.Line);
        	          }
        	        },
        	
        	        onMouseOut: function() {
        	
        	        	renderer.firephp.setWindowStatusBarText(null);
        	        },
        	                          
        	          getCaption: function(row)
        	          {
        	            if(!row) return '';
        	            
        	            if(row.meta && row.meta.Label) {
        	              return row.meta.Label;
        	            }
        	            
        	            return row.object[0];
        	          },
        	        
        	          onToggleBody: function(event)
        	          {
        	            var target = event.currentTarget;
        	            var logRow = DOM.getAncestorByClass(target, "logRow-firephp-table");
        	            if (EVENTS.isLeftClick(event))
        	            {
        	              CSS.toggleClass(logRow, "opened");
        	        
        	              if (CSS.hasClass(logRow, "opened"))
        	              {
        	        
        	                /* Lets only render the stack trace once we request it */        
        	                if (!DOM.getChildByClass(logRow, "head", "info"))
        	                {
        	                    this.infoTag.append({'object':DOM.getChildByClass(logRow, "head").repObject,
        	                                         'meta':DOM.getChildByClass(logRow, "head").repMeta},
        	                                        DOM.getChildByClass(logRow, "head"));
        	                }
        	              }
        	            }
        	          },
        	          
        	          getHeaderColumns: function(row) {
        	            
        	            try{
        	              if(row.meta && row.meta.Label) {
        	                return row.object[0];
        	              } else {
        	                // Do this for backwards compatibility
        	                return row.object[1][0];
        	              }
        	            } catch(e) {}
        	            
        	            return [];
        	          },
        	          
        	          getRows: function(row) {
        	            
        	            try{
        	              var rows = null;
        	              if(row.meta && row.meta.Label) {
        	                rows = row.object;
        	              } else {
        	                // Do this for backwards compatibility
        	                rows = row.object[1];
        	              }
        	              rows.splice(0,1);
        	              return rows;
        	            } catch(e) {}
        	            
        	            return [];
        	          },
        	          
        	          getColumns: function(row) {
        	
        	            if (!row) return [];
        	            
        	            var items = [];
        	
        	            try {
        	            
        	              for (var i = 0; i < row.length; ++i)
        	              {
        	                  var arg = row[i];
        	//    	              var rep = FirePHP.getRep(arg);
        	//    	              var tag = rep.shortTag ? rep.shortTag : rep.tag;
        	                  
        	                    var rep = FirebugReps.PHPVariable;
        	                  
        	                  if(typeof(arg)=='string') {
        	                    rep = FirebugReps.FirePHPText;
        	                  }
        	                  
        	                    var tag = rep.tag;
        	                    
        	                    
        	    /*  
        	    	                  if(!arg) {
        	    	                    var rep = Firebug.getRep(arg);
        	    	                    var tag = rep.shortTag ? rep.shortTag : rep.tag;
        	    	                  } else
        	    	                  if (arg.constructor.toString().indexOf("Array")!=-1 ||
        	    	                      arg.constructor.toString().indexOf("Object")!=-1) {
        	    	                    var rep = FirebugReps.PHPVariable;
        	    	                    var tag = rep.tag;
        	    	                    
        	//    	                    obj = new Object();
        	//    	                    obj.Array = arg;
        	//    	                    arg = ['Click for Data',obj];
        	    	                  } else {
        	    	                    var rep = FirebugReps.Text;
        	    	                    var tag = rep.shortTag ? rep.shortTag : rep.tag;
        	    	                  }
        	    	    */              
        	                  items.push({name: 'arg'+i, value: arg, tag: tag});
        	              }
        	            } catch(e) {}
        	            
        	            return items;
        	          },
        	          
        	        });
	            }
	            
				renderer.RegisterConsoleTemplate("exception", DOMPLATE.domplate(getTraceTemplate(renderer), {
		        	className: "firephp-exception",
			    }));

				renderer.RegisterConsoleTemplate("trace", DOMPLATE.domplate(getTraceTemplate(renderer), {
		        	className: "firephp-trace",
			    }));

				renderer.RegisterConsoleTemplate("table", getTableTemplate(renderer));
		        
	        	renderer.RegisterConsoleTemplate("upgrade", domplate(Firebug.Rep, {
		        	className: "firephp-upgrade",
		        	tag: DIV("You need to upgrade your FirePHP server library.",
		        			A({_object:"$object", onclick:'$upgradeLink'},'Upgrade Now!')),
		        	upgradeLink: function(event)
		        	{
		        		WINDOW.openNewTab(event.target.object.peerInfo.uri+event.target.object.peerInfo.version);
		        	}
			    }));	            
			}
		}
	};
});
