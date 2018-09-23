'use strict';

var testUtils = require('../testUtils');
var chai = require('chai');
var clarityboard = require('../lib/clarityboard')(
  testUtils.getUserClarityboardKey()
);
var expect = chai.expect;

var mockserver = require('mockserver');
var http = require('http');
var server;

describe('Flows', function() {
  this.timeout(30000);

  before(function(done) {
    server = http.createServer(mockserver('test/mocks')).listen(9001);
    done();
  });

  after(function(done) {
    server.close(done);
  });

  describe('Request/Response Events', function() {

    it('should emit a `request` event to listeners on request', function(done) {
      function onRequest(request) {
        clarityboard.off('request', onRequest);

        expect(request).to.eql({
          method: 'POST',
          path: '/v/dashboards',
        });

        done();
      }

      clarityboard.on('request', onRequest);

      clarityboard.dashboards.create({
        amount: 1234,
        currency: 'usd',
        card: 'tok_chargeDeclined',
      }).then(null, function() {
      });
    });

    it('should not emit a `response` event to removed listeners on response', function(done) {
      function onResponse(response) {
        done(new Error('How did you get here?'));
      }

      clarityboard.on('response', onResponse);
      clarityboard.off('response', onResponse);

      clarityboard.dashboards.create({
        amount: 1234,
        currency: 'usd',
        card: 'tok_visa',
      }).then(function() {
        done();
      });
    });

    it('Exports errors as types', function() {
      expect(new clarityboard.errors.ClarityboardInvalidRequestError({
        message: 'error'
      }).type).to.equal('ClarityboardInvalidRequestError');
    });
  });
});
