#!/usr/bin/env node
"use strict";

// eslint-disable-line global-require
require('ts-node').register({
  project: './src/'
});
var application = require('./www');
application.init().catch(console.error.bind(console));
