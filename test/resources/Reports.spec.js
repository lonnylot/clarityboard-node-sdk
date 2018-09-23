'use strict';

var clarityboard = require('../../testUtils').getSpyableClarityboard();
var expect = require('chai').expect;
var mockserver = require('mockserver');
var http = require('http');
var server;

var TEST_AUTH_KEY = 'aGN0bIwXnHdw5645VABjPdSn8nWY7G11';

describe('Reports Resource', function() {
  before(function(done) {
    server = http.createServer(mockserver('test/mocks')).listen(9001);
    done();
  });

  after(function(done) {
    server.close(done);
  });

  describe('create', function() {
    it('Sends the correct request', function() {
      clarityboard.reports.create({
        dashboardId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        name: 'My Report',
        chart: 'timeline',
        rules: [
          {
            type: 'record-group',
            value: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          {
            type: 'field',
            value: 'Q/A',
          },
          {
            type: 'date-constraint',
            value: 'Submitted'
          }
        ]
      });
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/reports',
        headers: {},
        data: {
          dashboardId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          name: 'My Report',
          chart: 'timeline',
          rules: [
            {
              type: 'record-group',
              value: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
            },
            {
              type: 'field',
              value: 'Q/A',
            },
            {
              type: 'date-constraint',
              value: 'Submitted'
            }
          ]
        },
      });
    });

    it('Sends the correct request [with specified auth]', function() {
      clarityboard.reports.create({
        dashboardId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        name: 'My Report',
        chart: 'timeline',
        rules: [
          {
            type: 'record-group',
            value: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          {
            type: 'field',
            value: 'Q/A',
          },
          {
            type: 'date-constraint',
            value: 'Submitted'
          }
        ]
      }, TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/reports',
        headers: {},
        data: {
          dashboardId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          name: 'My Report',
          chart: 'timeline',
          rules: [
            {
              type: 'record-group',
              value: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
            },
            {
              type: 'field',
              value: 'Q/A',
            },
            {
              type: 'date-constraint',
              value: 'Submitted'
            }
          ]
        },
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth and no body]', function() {
      clarityboard.reports.create(TEST_AUTH_KEY);
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/reports',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth in options]', function() {
      clarityboard.reports.create({
        dashboardId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        name: 'My Report',
        chart: 'timeline',
        rules: [
          {
            type: 'record-group',
            value: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          {
            type: 'field',
            value: 'Q/A',
          },
          {
            type: 'date-constraint',
            value: 'Submitted'
          }
        ]
      }, {api_key: TEST_AUTH_KEY});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/reports',
        headers: {},
        data: {
          dashboardId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          name: 'My Report',
          chart: 'timeline',
          rules: [
            {
              type: 'record-group',
              value: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
            },
            {
              type: 'field',
              value: 'Q/A',
            },
            {
              type: 'date-constraint',
              value: 'Submitted'
            }
          ]
        },
        auth: TEST_AUTH_KEY,
      });
    });

    it('Sends the correct request [with specified auth in options and no body]', function() {
      clarityboard.reports.create({api_key: TEST_AUTH_KEY});
      expect(clarityboard.LAST_REQUEST).to.deep.equal({
        method: 'POST',
        url: '/v/reports',
        headers: {},
        data: {},
        auth: TEST_AUTH_KEY,
      });
    });
  });

});
