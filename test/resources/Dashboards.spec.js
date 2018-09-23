'use strict';

var clarityboard = require('../../testUtils').getSpyableClarityboard();
var expect = require('chai').expect;
var mockserver = require('mockserver');
var http = require('http');
var server;

var TEST_AUTH_KEY = 'aGN0bIwXnHdw5645VABjPdSn8nWY7G11';

describe('Dashboards Resource', function() {
  before(function(done) {
    server = http.createServer(mockserver('test/mocks')).listen(9001);
    done();
  });

  after(function(done) {
    server.close(done);
  });

  describe('retrieve', function() {
    it('Sends the correct request', function() {
      clarityboard.dashboards.retrieve('abc123');
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v/dashboards/abc123',
        headers: {},
        data: {},
      });
    });

    it('Sends the correct request [with specified auth]', function() {
      clarityboard.dashboards.retrieve('abc123', TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v/dashboards/abc123',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with data]', function() {
      clarityboard.dashboards.retrieve('abc123', {timeframe: 'four-weeks'});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v/dashboards/abc123',
        headers: {},
        data: {
          timeframe: 'four-weeks'
        },
      });
    });

    it('Sends the correct request [with data and specified auth]', function() {
      clarityboard.dashboards.retrieve('abc123', {timeframe: 'four-weeks'}, TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v/dashboards/abc123',
        headers: {},
        data: {
          timeframe: 'four-weeks'
        },
        auth: TEST_AUTH_KEY,
      });
    });
  });

  describe('create', function() {
    it('Sends the correct request', function() {
      clarityboard.dashboards.create({name: 'Some name'});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/dashboards',
        headers: {},
        data: {name: 'Some name'},
      });
    });

    it('Sends the correct request [with specified auth]', function() {
      clarityboard.dashboards.create({name: 'Some name'}, TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/dashboards',
        headers: {},
        data: {name: 'Some name'},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth and no body]', function() {
      clarityboard.dashboards.create(TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/dashboards',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth in options]', function() {
      clarityboard.dashboards.create({name: 'Some name'}, {api_key: TEST_AUTH_KEY});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/dashboards',
        headers: {},
        data: {name: 'Some name'},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth in options and no body]', function() {
      clarityboard.dashboards.create({api_key: TEST_AUTH_KEY});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/dashboards',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });
  });

  describe('list', function() {
    it('Sends the correct request', function() {
      clarityboard.dashboards.list();
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v/dashboards',
        headers: {},
        data: {},
      });
    });

    it('Sends the correct request [with specified auth]', function() {
      clarityboard.dashboards.list(TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v/dashboards',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });
  });

});
