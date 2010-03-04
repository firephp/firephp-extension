

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var FILE = require("file");
var OS = require("os");


var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();


Builder.prototype.build = function(targetPackage, buildOptions) {
    
    // we are tying in a phing-based build process - http://phing.info/
    // lets run the phing build first, then copy the result to where PINF expects it
    
    var sourceBasePath = this.pkg.getPath().join("extension");
    
    var command = "cd " + sourceBasePath + "; phing -f build.xml build";
    OS.system(command);
    
    
    var targetPath = targetPackage.getBuildPath().join("extension");
    this.pkg.getPath().join("build", "extension").symlink(targetPath);
    
    
    // the existing build process copies files
    // to avoid needing to rebuild the extension with every change we remove the
    // chrome directory and link it to the sources
    // WARNING: The %%Version%% variable in chrome/content/firephp/FirePHP.js is not replaced this way
    // TODO: Skip linking when building extension for distribution
    
    command = "rm -Rf " + targetPath.join("chrome");
    OS.system(command);
    
    targetPath = targetPackage.getBuildPath().join("extension", "chrome");
    this.pkg.getPath().join("extension", "chrome").symlink(targetPath);

}
