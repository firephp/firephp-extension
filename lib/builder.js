
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var BUILDER = require("builder/program", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PACKAGE = require("package", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var UTIL = require("util");
var OS = require("os");
var FILE = require("file");


var ProgramBuilder = exports.ProgramBuilder = function() {
    if (!(this instanceof exports.ProgramBuilder))
        return new exports.ProgramBuilder();
}

ProgramBuilder.prototype = BUILDER.ProgramBuilder();


ProgramBuilder.prototype.build = function(buildOptions) {
    
    var mode = "build";
    
    if(buildOptions.args[0]=="dist") {
        mode = "dist";
    } else
    if(buildOptions.args[0]=="upload") {
        mode = "upload";
    }

    // we are tying in a phing-based build process - http://phing.info/
    // lets run the phing build first, then copy the result to where PINF expects it
    
    var sourceBasePath = this.sourcePackage.getPath().join("extension");
    
    var command = "cd " + sourceBasePath + "; phing -f build.xml " + mode;
    OS.system(command);


    if(mode=="build") {
        var targetPath = this.programPackage.getBuildPath().join("extension");

        this.sourcePackage.getPath().join("build", "extension").symlink(targetPath);

        // the existing build process copies files
        // to avoid needing to rebuild the extension with every change we remove the
        // chrome directory and link it to the sources
        // WARNING: The %%Version%% variable in chrome/content/firephp/FirePHP.js is not replaced this way
        
        command = "rm -Rf " + targetPath.join("chrome");
        OS.system(command);
        
        targetPath = targetPath.join("chrome");
        this.sourcePackage.getPath().join("extension", "chrome").symlink(targetPath);
    }
}
