
const PATH = require("path");
const FS = require("sm-util/lib/fs");
const PINF = require("pinf");
const TERM = require("sm-util/lib/term");
const OS = require("sm-util/lib/os");
const MD5 = require("sm-util/lib/md5").md5;
const EXEC = require("child_process").exec;


function main(callback) {

	// @see http://kb.mozillazine.org/Command_line_arguments
	var firefoxBinPath = PATH.join(__dirname, "../node_modules/firefox/Firefox.app/Contents/MacOS/firefox-bin");

	var extensions = {
		"FirePHPExtension-Build@firephp.org": PATH.join(__dirname, "../../extension"),
		"firebug@software.joehewitt.com": PATH.join(__dirname, "../node_modules/firebug"),
		"fbtrace@getfirebug.com": PATH.join(__dirname, "../node_modules/fbtrace")
	};

	function getFirefoxVersion(callback) {
		return OS.exec(firefoxBinPath + " -version", {
			cwd: __dirname
		}).then(function(stdout) {
			var m = stdout.match(/^Mozilla Firefox\s([\d]+)(\.[\d\.]+)?\n?$/);
			if (!m) {
				return new Error("Could not determine firefox version from '" + stdout + "'");
			}
			return callback(null, m[1]);
		}).fail(callback);
	}

	function ensureProfile(callback) {
		return getFirefoxVersion(function(err, version) {
			if (err) return callback(err);
			var profileInfo = {
				path: PATH.join(__dirname, "../.profiles/firefox-" + version)
			}
			profileInfo.name = "profile-" + MD5(profileInfo.path);
			function ready(callback) {
				return callback(null, profileInfo);
			}
			function ensureUserFile(callback) {
				var path = PATH.join(profileInfo.path, "user.js");
				if (!FS.existsSync(path)) {
					TERM.stdout.writenl("Writing profile config options to '" + path + "'");
					FS.writeFileSync(path, [
						'user_pref("javascript.options.showInConsole", true);',
						'user_pref("nglayout.debug.disable_xul_cache", true);',
						'user_pref("browser.dom.window.dump.enabled",  true);',
						'user_pref("javascript.options.strict", true);',
						'user_pref("extensions.logging.enabled", true);',
						'user_pref("browser.tabs.warnOnClose", false);',
						'user_pref("browser.rights.3.shown", true);',
						'user_pref("browser.shell.checkDefaultBrowser", false);',
						'user_pref("extensions.autoDisableScopes", 0);'
					].join("\n"));
				}
				return ready(callback);				
			}
			function ensureExtensions(callback) {
				var extensionsPath = PATH.join(profileInfo.path, "extensions");
				if (!FS.existsSync(extensionsPath)) {
					FS.mkdirsSync(extensionsPath);
				}
				for (var id in extensions) {
					var path = PATH.join(extensionsPath, id);
					if (!FS.existsSync(path)) {
						TERM.stdout.writenl("Linking extension '" + id + "' (" + extensions[id] + ") to '" + path + "'");
						FS.symlinkSync(extensions[id], path);
					}
				}
				return ensureUserFile(callback);				
			}
			if (FS.existsSync(profileInfo.path)) {
				return ensureExtensions(callback);
			}
			TERM.stdout.writenl("Creating profile '" + profileInfo.name + "' at '" + profileInfo.path + "'");
			if (!FS.existsSync(PATH.dirname(profileInfo.path))) {
				FS.mkdirsSync(PATH.dirname(profileInfo.path));
			}
			EXEC(firefoxBinPath + ' -CreateProfile "' + profileInfo.name + ' ' + profileInfo.path + '"', {}, function(error, stdout, stderr) {
				if (stderr && /Success: created profile/.test(stderr)) {
					return ensureExtensions(callback);
				}
				console.error(stdout);
				console.error(stderr);
				return new Error("Error creating profile");
			});
		});
	}

	function launchProfile(profileInfo, callback) {
		TERM.stdout.writenl("Launching profile '" + profileInfo.path + "'");
		return OS.spawnInline(firefoxBinPath, [
			"-P", profileInfo.name,
			"-no-remote",
			"-jsconsole"
		], {
			cwd: __dirname
		}).then(function() {
			return callback(null);
		}).fail(callback);
	}

	return ensureProfile(function(err, profileInfo) {
		if (err) return callback(err);
		return launchProfile(profileInfo, callback);
	});
}


if (require.main === module) {
	PINF.for(module).run(main);	
}
