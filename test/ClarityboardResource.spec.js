'use strict';

require('../testUtils');

var clarityboard = require('../testUtils').getSpyableClarityboard();
var expect = require('chai').expect;

var mockserver = require('mockserver');
var http = require('http');
var server;

describe('ClarityboardResource', function() {
  before(function(done) {
    server = http.createServer(mockserver('test/mocks')).listen(9001);
    done();
  });

  after(function(done) {
    server.close(done);
  });

  describe('createResourcePathWithSymbols', function() {
    it('Generates a path', function() {
      var path = clarityboard.dashboards.createResourcePathWithSymbols('{id}');
      expect(path).to.equal('/dashboards/{id}');
    });
  });

  describe('_defaultHeaders', function() {
    it('sets the Authorization header with Bearer auth using the global API key', function() {
      var headers = clarityboard.dashboards._defaultHeaders(null, 0);
      expect(headers.Authorization).to.equal('Bearer fakeAuthToken');
    });
    it('sets the Authorization header with Bearer auth using the specified API key', function() {
      var headers = clarityboard.dashboards._defaultHeaders('anotherFakeAuthToken', 0);
      expect(headers.Authorization).to.equal('Bearer anotherFakeAuthToken');
    });
  });
});
