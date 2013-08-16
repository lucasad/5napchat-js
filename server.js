var fs      = require('fs') 
  , meryl   = require('meryl')
  //, sessions= require('simple-session');
  
meryl.get('/', function(req,res){
    res.setHeader('Content-type', 'text/html; charset=UTF-8');
    fs.createReadStream('index.html').pipe(res);
});

meryl.get('/icons.css', function(req,res){
    res.setHeader('Content-type', 'text/css');
    fs.createReadStream('icons.css').pipe(res);
});

meryl.post('/upload', require("./upload.js"));
meryl.get('/upload', require("./upload.js"));
meryl.get('/blob/{username}/{id}', require('./blob'));


var sock_setup = require('./socket');
sock_setup(meryl);