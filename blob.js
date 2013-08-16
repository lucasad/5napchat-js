var util = require("util");
var snapchat = require("snapchat");
var auth_re = /(^|;\s*)auth_token=(\S+)($|;)/;

var getConn = require("./socket").getConn;

module.exports = function(req, res) {
    var client = new snapchat.Client();
    client.auth_token = req.headers.cookie.match(auth_re)[2];
    client.username = req.params.username;

    client.getBlob(req.params.id, res, function(err) {
        if (err) {
            res.setHeader('Content-type', 'text/plain');
            res.statusCode = 500;
            res.end(util.inspect(err));
            return;
        }
    });
};