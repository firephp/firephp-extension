
var SYSTEM = require("modules/system"),
    FILE = require("modules/file"),
    UTIL = require("modules/util"),
    JSON = require("modules/json"),
    Q = require("modules/q"),
    SOURCEMINT_CLIENT = false;

var basePath = FILE.dirname(FILE.dirname(FILE.dirname(module.id))),
	buildBasePath = basePath + "/build",
	programDescriptor = JSON.decode(FILE.read(basePath + "/program.json"));


// AddType application/x-xpinstall .xpi

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

		publish();
	});
}

function publish()
{
	module.print("\0cyan(Publishing FirePHP Firefox Extension to sourcemint\0)\n");

	var bundles = {};
	bundles[programDescriptor.name] = {
		"type": "mozilla-addon",
		"options": {
			"xpiPath": buildBasePath + "/firephp-extension-sourcemint-" + programDescriptor.version + ".xpi",
			"updateRdfPath": buildBasePath + "/firephp-extension-sourcemint.update.rdf"
		}
	};

	var packages = [
	    {
	    	"uid": programDescriptor.uid,
	    	"stream": programDescriptor.stream,
	    	"version": programDescriptor.version,
	    	"bundles": bundles
	    }
	];

	try
	{
		Q.when(SOURCEMINT_CLIENT.publish(packages), function(info)
		{
			module.print("\0green(Published:\n");
			console.log(info);
			module.print("\0)");
			
			done();
			
		}, function(e)
		{
			throw e;
		});	
	}
	catch(e)
	{
		console.error("Error: " + e);
	}
			

	function done()
	{
		module.print("\0green(Done\0)\n");
	}
}
