
const PATH = require("path");
const FS = require("sm-util/lib/fs");
const PINF = require("pinf");
const TERM = require("sm-util/lib/term");
const OS = require("sm-util/lib/os");


function main(callback) {

	var rootPath = PATH.join(__dirname, "../..");
	var pinf = PINF.forProgram(rootPath)(rootPath);
	var extensionSourcePath = PATH.join(rootPath, "extension");
	var packageDescriptor = pinf.descriptor();
	var version = packageDescriptor.version;
	var buildBasePath = PATH.join(rootPath, "build");

	TERM.stdout.writenl("\0cyan(Build FirePHP Firefox Extension version '" + version + "'.\0)");

	function prepare(callback) {
		var pinf = PINF.forProgram(extensionSourcePath)(extensionSourcePath);
		FS.removeSync(buildBasePath);
		return pinf.sm(function(err, sm) {
			if (err) return callback(err);
			return callback(null, {
				sm: sm
			});
		});
	}

	function syncVersion(API, callback) {
		var path = PATH.join(extensionSourcePath, "install.rdf");
		var content = FS.readFileSync(path).toString();
		var originalContent = content;
		content = content.replace(/(<em:version>)([^<]*)(<\/em:version>)/, "$1" + version + "$3");
		if (content != originalContent) {
			TERM.stdout.writenl("Updated version in: " + path);
			FS.writeFileSync(path, content);
		}
		return callback(null);
	}

	function exportTo(API, targetPath, callback) {
    	TERM.stdout.writenl("Copying\n  \0cyan(" + extensionSourcePath + "\0) to\n  \0cyan(" + targetPath + "\0)");
		return API.sm.export(targetPath, function(err) {
			if (err) return callback(err);
			var path = PATH.join(targetPath, "chrome/content/lib/firephp.js");
			var content = FS.readFileSync(path).toString();
			content = content.replace(/%%Version%%/, version);
			FS.writeFileSync(path, content);
			return callback(null);
		});
	}

	function exportAMO(API, callback) {
		var targetPath = PATH.join(buildBasePath, "firephp-extension-amo");
		return exportTo(API, targetPath, function(err) {
			if (err) return callback(err);
	    	TERM.stdout.writenl("Create XPI for: " + targetPath);
			return OS.exec("zip -r ../firephp-extension-amo-" + version + ".xpi  *", {
				cwd: targetPath
			}).then(function() {
				return callback(null);
			}).fail(callback);
		});
	}

	function exportSourcemint(API, callback) {
		var targetPath = PATH.join(buildBasePath, "firephp-extension-sourcemint");
		return exportTo(API, targetPath, function(err) {
			if (err) return callback(err);

			// TODO: Fetch these from sourcemint service.
			var XPI_UPDATE_URL = "https://s3.amazonaws.com/update.sourcemint.com/github.com/firephp/firephp-extension/-stream/stable/update.rdf?app.os=%APP_OS%&amp;app.version=%APP_VERSION%&amp;item.status=%ITEM_STATUS%&amp;item.version=%ITEM_VERSION%&amp;app.locale=%APP_LOCALE%";
			var XPI_DOWNLOAD_URL = "https://s3.amazonaws.com/download.sourcemint.com/github.com/firephp/firephp-extension/-stream/stable/firephp-extension-" + version + ".xpi";

			var path = null;
			var content = null;

			path = PATH.join(targetPath, "install.rdf");
			content = FS.readFileSync(path).toString();
			content = content.replace(/(<\/em:targetApplication>)/, "$1" + [
	            '<em:updateURL>' + XPI_UPDATE_URL + '</em:updateURL>'
			].join(""));
			FS.writeFileSync(path, content);
    	
			path = PATH.join(__dirname, "../etc/update.tpl.rdf");
			content = FS.readFileSync(path).toString();
			content = content.replace(/%%VERSION%%/, version);
			content = content.replace(/%%UPDATE_LINK_URL%%/, XPI_DOWNLOAD_URL);
			path = PATH.join(buildBasePath, "firephp-extension-sourcemint.update.rdf");
			FS.writeFileSync(path, content);

	    	TERM.stdout.writenl("Create XPI for: " + targetPath);
			return OS.exec("zip -r ../firephp-extension-sourcemint-" + version + ".xpi  *", {
				cwd: targetPath
			}).then(function() {
				return callback(null);
			}).fail(callback);
		});
	}

	return prepare(function(err, API) {
		if (err) return callback(err);

		return syncVersion(API, function(err) {
			if (err) return callback(err);

			return exportAMO(API, function(err) {
				if (err) return callback(err);

				return exportSourcemint(API, function(err) {
					if (err) return callback(err);

					TERM.stdout.writenl("\0green(Done\0)");

					return callback(null);
				});
			});
		});
	});
}


if (require.main === module) {
	PINF.for(module).run(main);	
}
