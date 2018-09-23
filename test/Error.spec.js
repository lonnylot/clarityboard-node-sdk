'use strict';

require('../testUtils');

var Error = require('../lib/Error');
var expect = require('chai').expect;

describe('Error', function() {
  it('Populates with type and message params', function() {
    var e = new Error('FooError', 'Foo happened');
    expect(e).to.have.property('type', 'FooError');
    expect(e).to.have.property('message', 'Foo happened');
    expect(e).to.have.property('stack');
  });

  describe('ClarityboardError', function() {
    it('Generates specific instance depending on error-type', function() {
      expect(Error.ClarityboardError.generate({type: 'invalid_request_error'})).to.be.instanceOf(
        Error.ClarityboardInvalidRequestError
      );
      expect(Error.ClarityboardError.generate({type: 'api_error'})).to.be.instanceOf(Error.ClarityboardAPIError);
    });

    it('Pulls in headers', function() {
      var headers = {'Request-Id': '123'};
      var e = Error.ClarityboardError.generate({type: 'api_error', headers: headers});
      expect(e).to.have.property('headers', headers);
    });

    it('Pulls in request IDs', function() {
      var e = Error.ClarityboardError.generate({type: 'api_error', requestId: 'foo'});
      expect(e).to.have.property('requestId', 'foo');
    });

    it('Pulls in HTTP status code', function() {
      var e = Error.ClarityboardError.generate({type: 'api_error', statusCode: 400});
      expect(e).to.have.property('statusCode', 400);
    });
  });
});
