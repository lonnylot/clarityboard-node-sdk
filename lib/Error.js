'use strict';

var utils = require('./utils');

module.exports = _Error;

/**
 * Generic Error klass to wrap any errors returned by clarityboard-node
 */
function _Error(raw) {
  this.populate.apply(this, arguments);
  this.stack = (new Error(this.message)).stack;
}

// Extend Native Error
_Error.prototype = Object.create(Error.prototype);

_Error.prototype.type = 'GenericError';
_Error.prototype.populate = function(type, message) {
  this.type = type;
  this.message = message;
};

_Error.extend = utils.protoExtend;

/**
 * Create subclass of internal Error klass
 * (Specifically for errors returned from Clarityboard's REST API)
 */
var ClarityboardError = _Error.ClarityboardError = _Error.extend({
  type: 'ClarityboardError',
  populate: function(raw) {
    // Move from prototype def (so it appears in stringified obj)
    this.type = this.type;

    this.stack = (new Error(raw.message)).stack;
    this.rawType = raw.type;
    this.code = raw.code;
    this.param = raw.param;
    this.message = raw.message;
    this.detail = raw.detail;
    this.raw = raw;
    this.headers = raw.headers;
    this.requestId = raw.requestId;
    this.statusCode = raw.statusCode;
  },
});

/**
 * Helper factory which takes raw clarityboard errors and outputs wrapping instances
 */
ClarityboardError.generate = function(rawClarityboardError) {
  switch (rawClarityboardError.type) {
  case 'invalid_request_error':
    return new _Error.ClarityboardInvalidRequestError(rawClarityboardError);
  case 'api_error':
    return new _Error.ClarityboardAPIError(rawClarityboardError);
  }
  return new _Error('Generic', 'Unknown Error');
};

// Specific Clarityboard Error types:
_Error.ClarityboardInvalidRequestError = ClarityboardError.extend({type: 'ClarityboardInvalidRequestError'});
_Error.ClarityboardAPIError = ClarityboardError.extend({type: 'ClarityboardAPIError'});
_Error.ClarityboardAuthenticationError = ClarityboardError.extend({type: 'ClarityboardAuthenticationError'});
_Error.ClarityboardPermissionError = ClarityboardError.extend({type: 'ClarityboardPermissionError'});
_Error.ClarityboardRateLimitError = ClarityboardError.extend({type: 'ClarityboardRateLimitError'});
_Error.ClarityboardConnectionError = ClarityboardError.extend({type: 'ClarityboardConnectionError'});
_Error.ClarityboardSignatureVerificationError = ClarityboardError.extend({type: 'ClarityboardSignatureVerificationError'});
