
var SYSTEM = require("modules/system"),
    FILE = require("modules/file"),
    UTIL = require("modules/util"),
    JSON = require("modules/json"),
    Q = require("modules/q");

var basePath = FILE.dirname(FILE.dirname(FILE.dirname(module.id))),
	extensionSourcePath = basePath + "/extension",
	buildBasePath = basePath + "/build",
	extensionBuildPath = buildBasePath + "/extension",
	programDescriptor = JSON.decode(FILE.read(basePath + "/program.json"));


exports.main = function(env)
{
	var exclusionFile;

	module.print("\0cyan(Build FirePHP Firefox Extension version: " + programDescriptor.version + "\0)\n");

	SYSTEM.exec("rm -Rf " + buildBasePath, next1);
	
	function next1()
	{
		FILE.mkdirs(buildBasePath, 0775)
		
    	module.print("Copying\n  \0cyan(" + extensionSourcePath + "\0) to\n  \0cyan(" + extensionBuildPath + "\0)\n");

        // write exclusion file
        // @see http://articles.slicehost.com/2007/10/10/rsync-exclude-files-and-folders

        exclusionFile = buildBasePath + "/.tmp_rsync-exclude~";
        FILE.write(exclusionFile, [
            ".DS_Store",
            ".tmp_*",
            "Thumbs.db",
            ""
        ].join("\n"));
        
        SYSTEM.exec("rsync -r --copy-links --exclude-from " + exclusionFile + " " + extensionSourcePath + "/* " + extensionBuildPath, next2);
	}
	
	function next2()
	{
/*
Extension.UpdateURL = http://www.firephp.org/Update/FirefoxExtension/${Version}${Release}/?app.os=%APP_OS%&amp;app.version=%APP_VERSION%&amp;item.status=%ITEM_STATUS%&amp;item.version=%ITEM_VERSION%&amp;app.locale=%APP_LOCALE%
Extension.UpdateLinkURL = http://www.firephp.org/DownloadRelease/FirePHP-FirefoxExtension-${Version}${Release}.xpi
Extension.UpdateKey = MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDP3d1lWrv680cl1DKDgse1IHeMgF0iLq5fiNKCdCkSWXbzQplSCNdWHUi2mZc2QnYyb4eOUlV7rTOUj1qNJJ9YOb5kINNmzrmUTF3Apf5339zn4lda+wo71DWqbPBKZxb/Khp1gk/97yi8i6VfWmZElRo5Ahlme2XhUwE8lUmQVwIDAQAB
 */		
		
		done();
	}
		

	function done()
	{
		module.print("\0green(Done\0)\n");
	}
}
