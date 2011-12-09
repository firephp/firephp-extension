
var SYSTEM = require("modules/system"),
    FILE = require("modules/file"),
    UTIL = require("modules/util"),
    JSON = require("modules/json"),
    Q = require("modules/q"),
    SOURCEMINT_CLIENT = false;

var basePath = FILE.dirname(FILE.dirname(FILE.dirname(module.id))),
	extensionSourcePath = basePath + "/extension",
	buildBasePath = basePath + "/build",
	programDescriptor = JSON.decode(FILE.read(basePath + "/program.json"));


exports.main = function(env)
{
	var exclusionFile;

	module.load({
		id: "github.com/cadorn/private-packages/sourcemint/client-js/",
		descriptor: {
			main: "lib/client.js"
		}
	}, function(id)
	{
		SOURCEMINT_CLIENT = require(id);

		build();
	});
}

function build()
{
	module.print("\0cyan(Build FirePHP Firefox Extension version '" + programDescriptor.version + "' for stream '" + programDescriptor.stream + "'.\0)\n");

	SYSTEM.exec("rm -Rf " + buildBasePath, next1);
	
	function next1()
	{
		var path = extensionSourcePath + "/install.rdf",
			content = FILE.read(path),
			originalContent = content;
		content = content.replace(/(<em:version>)([^<]*)(<\/em:version>)/, "$1" + programDescriptor.version + "$3");
		
		if (content != originalContent)
		{
			module.print("Updated version in: " + path + "\n");
			FILE.write(path, content);
		}

		next2();
	}
	
	function next2()
	{
		FILE.mkdirs(buildBasePath, 0775);
		
		var targetPath = buildBasePath + "/firephp-extension-amo";
		
    	module.print("Copying\n  \0cyan(" + extensionSourcePath + "\0) to\n  \0cyan(" + targetPath + "\0)\n");

        // write exclusion file
        // @see http://articles.slicehost.com/2007/10/10/rsync-exclude-files-and-folders

        exclusionFile = buildBasePath + "/.tmp_rsync-exclude~";
        FILE.write(exclusionFile, [
            ".DS_Store",
            ".tmp_*",
            "Thumbs.db",
            ""
        ].join("\n"));
        
        SYSTEM.exec("rsync -r --copy-links --exclude-from " + exclusionFile + " " + extensionSourcePath + "/* " + targetPath, function()
        {
        	var path = targetPath + "/chrome/content/lib/firephp.js";
    		var content = FILE.read(path);
    		content = content.replace(/%%Version%%/, programDescriptor.version);
    		FILE.write(path, content);

    		
        	targetPath = buildBasePath + "/firephp-extension-sourcemint";
    		
        	module.print("Copying\n  \0cyan(" + extensionSourcePath + "\0) to\n  \0cyan(" + targetPath + "\0)\n");

            // write exclusion file
            // @see http://articles.slicehost.com/2007/10/10/rsync-exclude-files-and-folders

            exclusionFile = buildBasePath + "/.tmp_rsync-exclude~";
            FILE.write(exclusionFile, [
                ".DS_Store",
                ".tmp_*",
                "Thumbs.db",
                ""
            ].join("\n"));
            
            SYSTEM.exec("rsync -r --copy-links --exclude-from " + exclusionFile + " " + extensionSourcePath + "/* " + targetPath, next3);
        });
	}

	function next3()
	{
		var targetPath = buildBasePath + "/firephp-extension-amo";

    	module.print("Create XPI for: " + targetPath + "\n");

        SYSTEM.exec("cd " + targetPath + "; zip -r ../firephp-extension-amo-" + programDescriptor.version + ".xpi  *", next4);
	}
	
	function next4()
	{
    	var xpiUpdateURL = SOURCEMINT_CLIENT.updateUrlForUID(programDescriptor.uid, {
    		"type": "mozilla-addon",
    		"stream": programDescriptor.stream,
    		"version": programDescriptor.version
    	});

    	var xpiDownloadURL = SOURCEMINT_CLIENT.downloadUrlForUID(programDescriptor.uid, {
    		"type": "mozilla-addon",
    		"stream": programDescriptor.stream,
    		"version": programDescriptor.version
    	});
    	
		var targetPath = buildBasePath + "/firephp-extension-sourcemint",
			path = targetPath + "/install.rdf";

		var content = FILE.read(path);
		content = content.replace(/(<\/em:targetApplication>)/, "$1" + [
            '<em:updateURL>' + xpiUpdateURL + '</em:updateURL>'
		].join(""));
		FILE.write(path, content);
		
		content = FILE.read(FILE.dirname(FILE.dirname(module.id)) + "/etc/update.tpl.rdf");
		content = content.replace(/%%VERSION%%/, programDescriptor.version);
		content = content.replace(/%%UPDATE_LINK_URL%%/, xpiDownloadURL);
		FILE.write(buildBasePath + "/firephp-extension-sourcemint.update.rdf", content);

		path = targetPath + "/chrome/content/lib/firephp.js";
		content = FILE.read(path);
		content = content.replace(/%%Version%%/, programDescriptor.version);
		FILE.write(path, content);
		
    	module.print("Create XPI for: " + targetPath + "\n");
        SYSTEM.exec("cd " + targetPath + "; zip -r ../firephp-extension-sourcemint-" + programDescriptor.version + ".xpi  *", done);
	}

	function done()
	{
		module.print("\0green(Done\0)\n");
	}
}
