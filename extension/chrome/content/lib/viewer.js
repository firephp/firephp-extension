
define([
	"firebug/firefox/firefox"
],
function(Firefox)
{
	var Viewer = function(firephp)
	{
		this.firephp = firephp;
		this.lastInspectorVariable = null;
		this.inspectorPinned = false;
	};
	
	Viewer.prototype.setWidth = function(width)
	{
		this.firephp.setPref("variableViewerWidth", width);
	};
	
	Viewer.prototype.getWidth = function()
	{
		var width = this.firephp.getPref("variableViewerWidth");
		if(!width) {
			width = "50%";
			this.setWidth(width);
		}
		return width;
	};
	  
	Viewer.prototype.sizeWidthTo = function(size)
	{
        this.firephp.app.logger.debug("Viewer.sizeWidthTo()");

        this.setWidth(size);
	    this.hide(true);
	    var self = this;
	    setTimeout(function() {
	        self.show(self.lastInspectorVariable, true);
	    }, 200);
	};
	
	Viewer.prototype.show = function(object, pinned)
	{
        this.firephp.app.logger.debug("Viewer.show()");
        
	    if(this.firephp.getPref("clickforvv") && !pinned) {
	        return;
	    }
	    
	    if (this.inspectorPinned && !pinned) {
  	        return; 
	    }
	    this.inspectorPinned = pinned;

	    this.lastInspectorVariable = object;

	    var browser = Firefox.getCurrentBrowser(),
	    	overlayObj = Firefox.getElementById("firephp-variable-inspector-overlay"),
	    	iframeObj = Firefox.getElementById("firephp-variable-inspector-iframe");

	    var bx = browser.boxObject.x;
        var by = browser.boxObject.y;
        var bw = browser.boxObject.width;
        var bh = browser.boxObject.height;
	        
        var w = bw-100;

        switch(this.getWidth())
        {
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
        if (w < 500) {
            w = 500;
        }
        var h = bh-40;
        
        overlayObj.hidden = false;
        overlayObj.setAttribute("style","left: "+(bx+(bw-w)/2)+"px; top: "+(by+(bh-h)/2)+"px; width: "+w+"px; height: "+h+"px;");

    	iframeObj.contentWindow.renderVariable(object, pinned);
	};

	Viewer.prototype.hide = function(force)
	{
		this.firephp.app.logger.debug("Viewer.show()");
	    
	    if (this.inspectorPinned && !force) {
	        return;
	    }

	    this.inspectorPinned = false;
	    
	    var overlayObj = Firefox.getElementById("firephp-variable-inspector-overlay");

	    overlayObj.hidden = true;
	};

	return Viewer;
});
