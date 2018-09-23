'use strict';

var http = require('http');
var https = require('https');
var path = require('path');

var utils = require('./utils');
var Error = require('./Error');

var hasOwn = {}.hasOwnProperty;

// Provide extension mechanism for clarityboard Resource Sub-Classes
ClarityboardResource.extend = utils.protoExtend;

// Expose method-creator & prepared (basic) methods
ClarityboardResource.method = require('./ClarityboardMethod');
ClarityboardResource.BASIC_METHODS = require('./ClarityboardMethod.basic');

/**
 * Encapsulates request logic for a Clarityboard Resource
 */
function ClarityboardResource(clarityboard, urlData) {
  this._clarityboard = clarityboard;
  this._urlData = urlData || {};

  this.basePath = utils.makeURLInterpolator(clarityboard.getApiField('basePath'));
  this.resourcePath = this.path;
  this.path = utils.makeURLInterpolator(this.path);

  if (this.includeBasic) {
    this.includeBasic.forEach(function(methodName) {
      this[methodName] = ClarityboardResource.BASIC_METHODS[methodName];
    }, this);
  }

  this.initialize.apply(this, arguments);
}

ClarityboardResource.prototype = {

  path: '',

  initialize: function() {},

  // Function to override the default data processor. This allows full control
  // over how a ClarityboardResource's request data will get converted into an HTTP
  // body. This is useful for non-standard HTTP requests. The function should
  // take method name, data, and headers as arguments.
  requestDataProcessor: null,

  // Function to add a validation checks before sending the request, errors should
  // be thrown, and they will be passed to the callback/promise.
  validateRequest: null,

  createFullPath: function(commandPath, urlData) {
    return path.join(
      this.basePath(urlData),
      this.path(urlData),
      typeof commandPath == 'function' ?
        commandPath(urlData) : commandPath
    ).replace(/\\/g, '/'); // ugly workaround for Windows
  },

  // Creates a relative resource path with symbols left in (unlike
  // createFullPath which takes some data to replace them with). For example it
  // might produce: /invoices/{id}
  createResourcePathWithSymbols: function(pathWithSymbols) {
    return '/' + path.join(
      this.resourcePath,
      pathWithSymbols || ''
    ).replace(/\\/g, '/'); // ugly workaround for Windows
  },

  createUrlData: function() {
    var urlData = {};
    // Merge in baseData
    for (var i in this._urlData) {
      if (hasOwn.call(this._urlData, i)) {
        urlData[i] = this._urlData[i];
      }
    }
    return urlData;
  },

  // DEPRECATED: Here for backcompat in case users relied on this.
  wrapTimeout: utils.callbackifyPromiseWithTimeout,

  _timeoutHandler: function(timeout, req, callback) {
    var self = this;
    return function() {
      var timeoutErr = new Error('ETIMEDOUT');
      timeoutErr.code = 'ETIMEDOUT';

      req._isAborted = true;
      req.abort();

      callback.call(
        self,
        new Error.ClarityboardConnectionError({
          message: 'Request aborted due to timeout being reached (' + timeout + 'ms)',
          detail: timeoutErr,
        }),
        null
      );
    }
  },

  _responseHandler: function(req, callback) {
    var self = this;
    return function(res) {
      var response = '';

      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        response += chunk;
      });
      res.on('end', function() {
        var headers = res.headers || {};
        // NOTE: Clarityboard responds with lowercase header names/keys.

        // For convenience, make Request-Id easily accessible on
        // lastResponse.
        res.requestId = headers['request-id'];

        var responseEvent = utils.removeEmpty({
          api_version: headers['clarityboard-version'],
          account: headers['clarityboard-account'],
          idempotency_key: headers['idempotency-key'],
          method: req._requestEvent.method,
          path: req._requestEvent.path,
          status: res.statusCode,
          request_id: res.requestId,
          elapsed: Date.now() - req._requestStart,
        });

        self._clarityboard._emitter.emit('response', responseEvent);

        try {
          response = JSON.parse(response);

          if (response.error) {
            var err;

            response.error.headers = headers;
            response.error.statusCode = res.statusCode;
            response.error.requestId = res.requestId;

            if (res.statusCode === 401) {
              err = new Error.ClarityboardAuthenticationError(response.error);
            } else if (res.statusCode === 403) {
              err = new Error.ClarityboardPermissionError(response.error);
            } else if (res.statusCode === 429) {
              err = new Error.ClarityboardRateLimitError(response.error);
            } else {
              err = Error.ClarityboardError.generate(response.error);
            }
            return callback.call(self, err, null);
          }
        } catch (e) {
          return callback.call(
            self,
            new Error.ClarityboardAPIError({
              message: 'Invalid JSON received from the Clarityboard API',
              response: response,
              exception: e,
              requestId: headers['request-id'],
            }),
            null
          );
        }
        // Expose res object
        Object.defineProperty(response, 'lastResponse', {
          enumerable: false,
          writable: false,
          value: res,
        });
        callback.call(self, null, response);
      });
    };
  },

  _errorHandler: function(req, callback) {
    var self = this;
    return function(error) {
      if (req._isAborted) {
        // already handled
        return;
      }
      callback.call(
        self,
        new Error.ClarityboardConnectionError({
          message: 'An error occurred with our connection to Clarityboard',
          detail: error,
        }),
        null
      );
    }
  },

  _defaultHeaders: function(auth, contentLength) {
    var userAgentString = 'Clarityboard/v1 NodeBindings/' + this._clarityboard.getConstant('PACKAGE_VERSION');

    if (this._clarityboard._appInfo) {
      userAgentString += ' ' + this._clarityboard.getAppInfoAsString();
    }

    var headers = {
      // Use specified auth token or use default from this clarityboard instance:
      'Authorization': auth ?
        'Bearer ' + auth :
        this._clarityboard.getApiField('auth'),
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': contentLength,
      'User-Agent': userAgentString,
    };

    return headers;
  },

  _request: function(method, host, path, data, auth, options, callback) {
    var self = this;
    var requestData;

    function makeRequestWithData(error, data) {
      var headers;

      if (error) {
        return callback(error);
      }

      requestData = data;
      headers = self._defaultHeaders(auth, requestData.length);

      self._clarityboard.getClientUserAgent(function(cua) {
        headers['X-Clarityboard-Client-User-Agent'] = cua;

        if (options.headers) {
          Object.assign(headers, options.headers);
        }

        makeRequest(headers);
      });
    }

    if (self.requestDataProcessor) {
      self.requestDataProcessor(method, data, options.headers, makeRequestWithData);
    } else {
      makeRequestWithData(null, utils.stringifyRequestData(data || {}));
    }

    function makeRequest(headers) {
      var timeout = self._clarityboard.getApiField('timeout');
      var isInsecureConnection = self._clarityboard.getApiField('protocol') == 'http';

      var req = (
        isInsecureConnection ? http : https
      ).request({
        host: host || self._clarityboard.getApiField('host'),
        port: self._clarityboard.getApiField('port'),
        path: path,
        method: method,
        agent: self._clarityboard.getApiField('agent'),
        headers: headers,
        ciphers: 'DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5',
      });

      var requestEvent = utils.removeEmpty({
        account: headers['Clarityboard-Account'],
        method: method,
        path: path,
      });

      req._requestEvent = requestEvent;

      req._requestStart = Date.now();

      self._clarityboard._emitter.emit('request', requestEvent);

      req.setTimeout(timeout, self._timeoutHandler(timeout, req, callback));
      req.on('response', self._responseHandler(req, callback));
      req.on('error', self._errorHandler(req, callback));

      req.on('socket', function(socket) {
        if (socket.connecting) {
          socket.on((isInsecureConnection ? 'connect' : 'secureConnect'), function() {
            // Send payload; we're safe:
            req.write(requestData);
            req.end();
          });
        } else {
          // we're already connected
          req.write(requestData);
          req.end();
        }
      });
    }
  },

};

module.exports = ClarityboardResource;
