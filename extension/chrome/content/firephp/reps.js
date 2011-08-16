
FBL.ns(function() { with (FBL) {

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

      FirePHP.showVariableInspectorOverlay(event.currentTarget.repObject);
    },
    
    onMouseOut: function() {

      if(this.pinInspector) return;
      
      FirePHP.hideVariableInspectorOverlay();
    },    
    
    onMouseOver2: function(event) {
      
      if(event.currentTarget.repInObject.meta
         && event.currentTarget.repInObject.meta.File
         && event.currentTarget.repInObject.meta.Line) {

        FirePHP.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
          + ' : '
          + event.currentTarget.repInObject.meta.Line);
      }
    },
    
    onMouseOut2: function() {

      FirePHP.setWindowStatusBarText(null);
    },
    
    onClick: function(event) {

      this.pinInspector = true;
      
      FirePHP.showVariableInspectorOverlay(event.currentTarget.repObject,true);
    },

    
    getTag: function(object) {
      var rep = FirePHP.getRep(object);
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

                var nameRep = FirePHP.getRep(name);
                var nameTag = nameRep.shortTag ? nameRep.shortTag : nameRep.tag;
    
                
                var valueRep = FirePHP.getRep(val);
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
  
                  var nameRep = FirePHP.getRep(name);
                  var nameTag = nameRep.shortTag ? nameRep.shortTag : nameRep.tag;
      
                  var valueRep = FirePHP.getRep(val);
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

      FirePHP.showVariableInspectorOverlay(event.currentTarget.repObject);
    },
    
    onMouseOut: function() {

      if(this.pinInspector) return;
      
      FirePHP.hideVariableInspectorOverlay();
    },

    onClick: function(event) {

      this.pinInspector = true;
      
      FirePHP.showVariableInspectorOverlay(event.currentTarget.repObject,true);
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

        FirePHP.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
          + ' : '
          + event.currentTarget.repInObject.meta.Line);
      }
    },
    
    onMouseOut: function() {
      FirePHP.setWindowStatusBarText(null);
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

        FirePHP.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
          + ' : '
          + event.currentTarget.repInObject.meta.Line);
      }
    },
    
    onMouseOut: function() {
      FirePHP.setWindowStatusBarText(null);
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

        FirePHP.setWindowStatusBarText(event.currentTarget.repInObject.meta.File
          + ' : '
          + event.currentTarget.repInObject.meta.Line);
      }
    },
    
    onMouseOut: function() {
      FirePHP.setWindowStatusBarText(null);
    }
});


// ************************************************************************************************

FirePHP.setDefaultRep(FirebugReps.FirePHPArr);

FirePHP.registerRep(
//    FirebugReps.PHPVariable,
//    FirebugReps.FirePHPArray,
    FirebugReps.FirePHPClass,
    FirebugReps.FirePHPBoolean,
    FirebugReps.FirePHPNumber,
    FirebugReps.FirePHPString
);

}});


