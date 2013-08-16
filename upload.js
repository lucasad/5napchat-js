var fs = require("fs");
var util = require("util");
var auth_re = /(^|;\s*)auth_token=(\S+)($|;)/;
var formidable = require('formidable');
var socket = require("./socket");

var trimString = function(string) {
    return string.trim();
};

module.exports = function(req, res) {
    var auth_token = req.headers.cookie.match(auth_re)[2];
    var blob;
    var opts = {};
    var recipients = [];

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.statusCode = 400;
            res.end(err);
            return;
        }

        if (!fields.recipients || !files.file) {
            res.statusCode = 400;
            res.end('Missing recpients or file');
            return;
        }
        console.log(fields.recipients);
        var path = files.file.path;

        var client = socket.getClient(auth_token);
        if(client === undefined) {
            res.statusCode = 403;
            return res.end();
        }
        client.upload(fs.createReadStream(path).on('end', function(){
            fs.unlink(path);
        }), fields.recipients, {
            time: fields.time,
            isVideo: files.file.type.substr(0, 5) == "video"
        });
        res.end();
    });
};