'use strict';

Clarityboard.DEFAULT_HOST = 'api.clarityboard.com';
Clarityboard.DEFAULT_PORT = '443';
Clarityboard.DEFAULT_BASE_PATH = '/v/';

// Use node's default timeout:
Clarityboard.DEFAULT_TIMEOUT = require('http').createServer().timeout;

Clarityboard.PACKAGE_VERSION = require('../package.json').version;

Clarityboard.USER_AGENT = {
  bindings_version: Clarityboard.PACKAGE_VERSION,
  lang: 'node',
  lang_version: process.version,
  platform: process.platform,
  publisher: 'clarityboard',
  uname: null,
};

Clarityboard.USER_AGENT_SERIALIZED = null;

var APP_INFO_PROPERTIES = ['name', 'url'];

var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;

var resources = {
  Dashboards: require('./resources/Dashboards'),
  Records: require('./resources/Records'),
  RecordGroups: require('./resources/RecordGroups'),
  Reports: require('./resources/Reports'),
};

Clarityboard.ClarityboardResource = require('./ClarityboardResource');
Clarityboard.resources = resources;

function Clarityboard(key) {
  if (!(this instanceof Clarityboard)) {
    return new Clarityboard(key);
  }

  Object.defineProperty(this, '_emitter', {
    value: new EventEmitter(),
    enumerable: false,
    configurable: false,
    writeable: false,
  });

  this.on = this._emitter.on.bind(this._emitter);
  this.off = this._emitter.removeListener.bind(this._emitter);

  this._api = {
    auth: null,
    host: Clarityboard.DEFAULT_HOST,
    port: Clarityboard.DEFAULT_PORT,
    basePath: Clarityboard.DEFAULT_BASE_PATH,
    timeout: Clarityboard.DEFAULT_TIMEOUT,
    agent: null,
    dev: false,
  };

  this._prepResources();
  this.setApiKey(key);

  this.errors = require('./Error.js');
  this.webhooks = require('./Webhooks');
}

Clarityboard.prototype = {

  setHost: function(host, port, protocol) {
    this._setApiField('host', host);
    if (port) {
      this.setPort(port);
    }
    if (protocol) {
      this.setProtocol(protocol);
    }
  },

  setProtocol: function(protocol) {
    this._setApiField('protocol', protocol.toLowerCase());
  },

  setPort: function(port) {
    this._setApiField('port', port);
  },

  setApiKey: function(key) {
    if (key) {
      this._setApiField(
        'auth',
        'Bearer ' + key
      );
    }
  },

  setTimeout: function(timeout) {
    this._setApiField(
      'timeout',
      timeout == null ? Clarityboard.DEFAULT_TIMEOUT : timeout
    );
  },

  setAppInfo: function(info) {
    if (info && typeof info !== 'object') {
      throw new Error('AppInfo must be an object.');
    }

    if (info && !info.name) {
      throw new Error('AppInfo.name is required');
    }

    info = info || {};

    var appInfo = APP_INFO_PROPERTIES.reduce(function(accum, prop) {
      if (typeof info[prop] == 'string') {
        accum = accum || {};

        accum[prop] = info[prop];
      }

      return accum;
    }, undefined);

    // Kill the cached UA string because it may no longer be valid
    Clarityboard.USER_AGENT_SERIALIZED = undefined;

    this._appInfo = appInfo;
  },

  setHttpAgent: function(agent) {
    this._setApiField('agent', agent);
  },

  _setApiField: function(key, value) {
    this._api[key] = value;
  },

  getApiField: function(key) {
    return this._api[key];
  },

  getConstant: function(c) {
    return Clarityboard[c];
  },

  // Gets a JSON version of a User-Agent and uses a cached version for a slight
  // speed advantage.
  getClientUserAgent: function(cb) {
    if (Clarityboard.USER_AGENT_SERIALIZED) {
      return cb(Clarityboard.USER_AGENT_SERIALIZED);
    }
    this.getClientUserAgentSeeded(Clarityboard.USER_AGENT, function(cua) {
      Clarityboard.USER_AGENT_SERIALIZED = cua;
      cb(Clarityboard.USER_AGENT_SERIALIZED);
    })
  },

  // Gets a JSON version of a User-Agent by encoding a seeded object and
  // fetching a uname from the system.
  getClientUserAgentSeeded: function(seed, cb) {
    var self = this;

    exec('uname -a', function(err, uname) {
      var userAgent = {};
      for (var field in seed) {
        userAgent[field] = encodeURIComponent(seed[field]);
      }

      // URI-encode in case there are unusual characters in the system's uname.
      userAgent.uname = encodeURIComponent(uname) || 'UNKNOWN';

      if (self._appInfo) {
        userAgent.application = self._appInfo;
      }

      cb(JSON.stringify(userAgent));
    });
  },

  getAppInfoAsString: function() {
    if (!this._appInfo) {
      return '';
    }

    var formatted = this._appInfo.name;

    if (this._appInfo.url) {
      formatted += ' (' + this._appInfo.url + ')';
    }

    return formatted;
  },

  _prepResources: function() {
    for (var name in resources) {
      this[
        name[0].toLowerCase() + name.substring(1)
      ] = new resources[name](this);
    }
  },

};

module.exports = Clarityboard;
// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Clarityboard = Clarityboard;
