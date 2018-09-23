'use strict';

var clarityboard = require('../../testUtils').getSpyableClarityboard();
var expect = require('chai').expect;
var mockserver = require('mockserver');
var http = require('http');
var server;

var TEST_AUTH_KEY = 'aGN0bIwXnHdw5645VABjPdSn8nWY7G11';

describe('Record Groups Resource', function() {
  before(function(done) {
    server = http.createServer(mockserver('test/mocks')).listen(9001);
    done();
  });

  after(function(done) {
    server.close(done);
  });

  describe('update', function() {
    it('Sends the correct request', function() {
      clarityboard.recordGroups.update({group: 'Group Name', data: {name: 'Some Name'}});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'PUT',
        url: '/v/records/groups',
        headers: {},
        data: {group: 'Group Name', data: {name: 'Some Name'}},
      });
    });

    it('Sends the correct request [with specified auth]', function() {
      clarityboard.recordGroups.update({group: 'Group Name', data: {name: 'Some Name'}}, TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'PUT',
        url: '/v/records/groups',
        headers: {},
        data: {group: 'Group Name', data: {name: 'Some Name'}},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with data]', function() {
      clarityboard.recordGroups.update({group: 'Group Name', data: {name: 'Some Name'}});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'PUT',
        url: '/v/records/groups',
        headers: {},
        data: {group: 'Group Name', data: {name: 'Some Name'}},
      });
    });

    it('Sends the correct request [with data and specified auth]', function() {
      clarityboard.recordGroups.update({group: 'Group Name', data: {name: 'Some Name'}}, TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'PUT',
        url: '/v/records/groups',
        headers: {},
        data: {group: 'Group Name', data: {name: 'Some Name'}},
        auth: TEST_AUTH_KEY,
      });
    });
  });

  describe('list', function() {
    it('Sends the correct request', function() {
      clarityboard.recordGroups.list();
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v/records/groups',
        headers: {},
        data: {},
      });
    });

    it('Sends the correct request [with specified auth]', function() {
      clarityboard.recordGroups.list(TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v/records/groups',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });
  });

});
