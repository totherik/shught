'use strict';

var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var shught = require('../');


var app, server1, server2, options, server3;

app = express();
app.use(shught());
app.get('/', function (req, res) {
    res.end('ok');
});

app.on('shutdown', function () {
    console.log('shutdown');
});

app.on('close', function () {
   console.log('close');
});

server1 = http.createServer(app);
server1.timeout = 5000;
server1.listen(8000);

server2 = http.createServer(app);
server2.timeout = 5000;
server2.listen(8001);


options = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
};

server3 = https.createServer(options, app);
server3.timeout = 5000;
server3.listen(8443);