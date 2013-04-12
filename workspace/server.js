
const PATH = require("path");
const EXPRESS = require("express");
const HBS = require("hbs");

const PORT = 8080;

exports.main = function(callback) {
    try {
        var app = EXPRESS();

        mountTests(app);

        var hbs = HBS.create();
        
        app.set("view engine", "hbs");

        app.engine("html", hbs.__express);
        app.engine("hbs", hbs.__express);
        app.set("views", PATH.join(__dirname, "views"));
        app.get(/^\/$/, function(req, res, next) {
            var page = req.params[0] || "index";
            try {
                res.render(page, {});
            } catch(err) {
                return next(err);
            }
        });

        mountStaticDir(app, /^\/ui\/(.*)$/, PATH.join(__dirname, "ui"));

        var server = app.listen(PORT);

        console.log("open http://localhost:" + PORT + "/");

        return callback(null, {
            server: server,
            port: PORT
        });

    } catch(err) {
        return callback(err);
    }
}


function mountStaticDir(app, route, path) {
    app.get(route, function(req, res, next) {
        var originalUrl = req.url;
        req.url = req.params[0];
        EXPRESS.static(path)(req, res, function() {
            req.url = originalUrl;
            return next.apply(null, arguments);
        });
    });
};


function mountTests(app) {

    app.get(/^\/tests\/aliases$/, function(req, res, next) {
        res.writeHead(200, {
            'X-Wf-1-1-1-1': '181|[{"Type":"LOG","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":6},"Hello World"]|',
            'X-Wf-1-1-1-10': '176|[{"Type":"ERROR","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":20},"err"]|',
            'X-Wf-1-1-1-11': '192|[{"Type":"ERROR","Label":"Label","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":21},"err"]|',
            'X-Wf-1-1-1-12': '740|[{"Type":"TRACE","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":23},{"Class":"FirePHP","Type":"->","Function":"trace","Message":"Trace to here","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":23,"Args":["Trace to here"],"Trace":[{"file":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/index.php","line":143,"args":["\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php"],"function":"require_once"}]}]|',
            'X-Wf-1-1-1-13': '759|[{"Type":"TRACE","Label":"","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":24},{"Class":"FirePHP","Type":"->","Function":"fb","Message":"Trace to here","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":24,"Args":["Trace to here","","TRACE"],"Trace":[{"file":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/index.php","line":143,"args":["\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php"],"function":"require_once"}]}]|',
            'X-Wf-1-1-1-14': '212|[{"Type":"TABLE","Label":"Test Table","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":26},[["header"],["row"]]]|',
            'X-Wf-1-1-1-2': '197|[{"Type":"LOG","Label":"Label","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":7},"Hello World"]|',
            'X-Wf-1-1-1-4': '174|[{"Type":"LOG","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":11},"log"]|',
            'X-Wf-1-1-1-5': '190|[{"Type":"LOG","Label":"Label","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":12},"log"]|',
            'X-Wf-1-1-1-6': '176|[{"Type":"INFO","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":14},"info"]|',
            'X-Wf-1-1-1-7': '192|[{"Type":"INFO","Label":"Label","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":15},"info"]|',
            'X-Wf-1-1-1-8': '176|[{"Type":"WARN","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":17},"warn"]|',
            'X-Wf-1-1-1-9': '192|[{"Type":"WARN","Label":"Label","File":"\\/pinf\\/programs\\/com.developercompanion.reference\\/packages\\/lib-php-standalone\\/examples\\/TestRunner\\/classic-firebug\\/Aliases.php","Line":18},"warn"]|',
            'X-Wf-1-2-1-3': '15|{"key":"value"}|',
            'X-Wf-1-Index': '14',
            'X-Wf-1-Plugin-1': 'http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.0.0master1106021548',
            'X-Wf-1-Structure-1': 'http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1',
            'X-Wf-1-Structure-2': 'http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1',
            'X-Wf-Protocol-1': 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2'
        });
        res.end([
            '<html>',
            '<head><title>Aliases Test</title></head>',
            '<body>Aliases Test</body>',
            '</html>'
        ].join("\n"));
    });

    app.get(/^\/tests\/inject-script$/, function(req, res, next) {
        res.writeHead(200, {
            'X-Wf-1-1-1-1': '85|{"RequestHeaders":{"1":"1","2":"2","3":"3","<script>alert(window)<\\/SCRIPT>":"LOL!"}}|',
            'X-Wf-1-Structure-1': 'http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1',
            'X-Wf-1-Plugin-1': 'http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.3',
            'X-Wf-Protocol-1': 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2',
        });
        res.end([
            '<html>',
            '<head><title>Script Inject Test</title></head>',
            '<body>Script Inject Test</body>',
            '</html>'
        ].join("\n"));
    });
}


if (require.main === module) {
    exports.main(function(err) {
        if (err) {
            console.error(err.stack);
            process.exit(1);
        }
    });
}
