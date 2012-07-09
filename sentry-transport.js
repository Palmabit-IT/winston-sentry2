var util = require('util'),
    raven = require('raven'),
    winston = require('winston')
    _ = require('underscore');
    
var Sentry = winston.transports.CustomerLogger = function (options) {

  this.name = 'Sentry';
  this._dsn = options.dsn || '';
  this._patchGlobal = options.patchGlobal || false;
  this._sentry = new raven.Client(this._dsn);
  this._logger = options.logger || 'root';
  
  if(this.patchGlobal) {
    this._sentry.patchGlobal();
  }
  
  this._levels_map = {
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error',
  }

  // Set the level from your options
  this.level = options.level || 'info';

  // Handle errors
  this._sentry.on('error', function() {
    console.log("Cannot talk to sentry!");
  });
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(Sentry, winston.Transport);

Sentry.prototype.log = function (level, msg, meta, callback) {
  // TODO: handle this better
  level = this._levels_map[level] || this.level;
  meta = meta || {};
  
  extra = _.extend(meta, {
    'level': level,
    'logger': this.logger
  });
  
  try {
    this._sentry.captureMessage(msg, extra, function(err) {
      callback(null, true);
    });
  } catch(err) {
    console.log(err);
  }
};

module.exports = Sentry;