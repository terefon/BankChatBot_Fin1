/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var allowCrossDomain = function(req, res, next) {
	req.header('Access-Control-Allow-Origin', '*');
	req.header('Access-Control-Allow-Credentials', 'true');
    req.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    req.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '*');

    next();
}

require('dotenv').config();
var cors = require('cors');
var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var rateLimit = require('express-rate-limit');
var helmet = require('helmet');
var port = process.env.VCAP_APP_PORT || process.env.PORT || 3010;

var fs = require("fs");

var options = {
    key: fs.readFileSync('./test/ssl/key.pem'),
    cert: fs.readFileSync('./test/ssl/cert.pem'),
    passphrase: 'abcde12345-'
}

var http = require('https').createServer(options, app);
//var http = require('http').createServer(app)
var debug = require('debug')('bot:server');

// Deployment tracking
require('cf-deployment-tracker-client').track();

// configure express
app.use(helmet());
app.use('/api/', rateLimit({
  windowMs: 60 * 1000, // seconds
  delayMs: 0,
  max: 15
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('public'));
app.use(cors());
app.use(allowCrossDomain);

app.use(session({
  secret: 'userData',
  resave: false,
  cookie: {maxAge: 3600000},
  saveUninitialized: true
}));

// Helper Function to check for enviornment variables
var checkAndRequire = function(envItem, toRequire, debugMessage) {
  if (envItem && envItem.match(/true/i)) {
    if (debugMessage) {
        debug(debugMessage);
    }
    require(toRequire)(app,controller);
  }
};

// configure the channels
var controller = require('./lib/controller');
checkAndRequire(process.env.USE_WEBUI, './lib/bot/web-ui', 'Initializing WebUI');

http.listen(port, function () {
  debug('Server listening on port: ' + port);
});


module.exports = http
