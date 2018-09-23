'use strict';

var clarityboard = require('../../testUtils').getSpyableClarityboard();
var expect = require('chai').expect;
var mockserver = require('mockserver');
var http = require('http');
var server;

var TEST_AUTH_KEY = 'aGN0bIwXnHdw5645VABjPdSn8nWY7G11';

describe('Records Resource', function() {
  before(function(done) {
    server = http.createServer(mockserver('test/mocks')).listen(9001);
    done();
  });

  after(function(done) {
    server.close(done);
  });

  describe('create', function() {
    it('Sends the correct request', function() {
      clarityboard.records.create({group: 'Group Name', data: {name: 'Some Name'}});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/records',
        headers: {},
        data: {group: 'Group Name', data: {name: 'Some Name'}},
      });
    });

    it('Sends the correct request [with specified auth]', function() {
      clarityboard.records.create({group: 'Group Name', data: {name: 'Some Name'}}, TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/records',
        headers: {},
        data: {group: 'Group Name', data: {name: 'Some Name'}},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth and no body]', function() {
      clarityboard.records.create(TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/records',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth in options]', function() {
      clarityboard.records.create({group: 'Group Name', data: {name: 'Some Name'}}, {api_key: TEST_AUTH_KEY});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/records',
        headers: {},
        data: {group: 'Group Name', data: {name: 'Some Name'}},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth in options and no body]', function() {
      clarityboard.records.create({api_key: TEST_AUTH_KEY});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/records',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });
  });

});
