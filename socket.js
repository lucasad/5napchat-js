var snapchat = require("snapchat");
var sockjs = require("sockjs");
var http = require("http");
var util = require("util");

var server = sockjs.createServer({
    sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"
});
var sendTo = function(conn, message) {
    var data = JSON.stringify(message);
    conn.write(data);
}

var clients = {};

server.on('connection', function(conn) {
    var client = new snapchat.Client();
    var loggedin = false;
    var oldAuth;
    client.on('sync', function(data) {
        if (!loggedin) {
            clients[data.auth_token] = client;
            loggedin = true;
            sendTo(conn, {
                action: 'login'
            });
        }

        sendTo(conn, {
            action: 'sync',
            data: data
        });
    });
    client.on('error', function(err) {
        sendTo(conn, {
            state: 'error',
            err: err
        });
        console.log(err);
    });
    conn.on('data', function(data) {
        var message = JSON.parse(data);
        switch (message.action) {
        case "login":
            client.login(message.user, message.pass);
            break;
        case "relogon":
            client.auth_token = message.auth_token;
            client.username = message.user;
            client.sync();
            break;
        case "logout":
            client.logout();
            loggedin = false;
            sendTo(conn, {action:'logout'});
            break;
        case "rename":
            client.rename(message.friend, message.name);
            break;
        case "addFriend":
            client.addFriend(message.friend);
            break;
        case "unfriend":
            client.unfriend(message.friend);
            break;
        default:
            console.log(message);
        }
    });

    conn.on('close', function() {
        delete clients[client.auth_token];
    });
});

module.exports = function(meryl) {
    var listener = server.listener({
        prefix: '/rt'
    });
    var handler = listener.getHandler();
    meryl.plug(function(req, res, next) {
        if (!handler(req, res)) next();
    });
    var app = http.createServer(meryl.cgi());
    app.addListener('upgrade', handler);
    app.listen('/tmp/5napchat');
};

module.exports.getClient = function(auth_token) {
    return clients[auth_token];
};
