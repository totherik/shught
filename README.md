shught
---------

```javascript
'use strict';

var http = require('http');
var express = require('express');
var shught = require('shught');

var app, server;

app = express();
app.use(shught());

server = http.createServer(app);
server.listen(8000);

```