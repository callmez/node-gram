'use strict';

const Config = require('./lib/Config');
const MtpApiManager = require('./lib/MtpApiManager');

module.exports = {
  Config,
  Api: MtpApiManager,
};
