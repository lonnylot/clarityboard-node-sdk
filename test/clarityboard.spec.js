'use strict';

var testUtils = require('../testUtils');
var clarityboard = require('../lib/clarityboard')(
  testUtils.getUserClarityboardKey()
);
clarityboard.setHost('localhost', '9001', 'http');

var mockserver = require('mockserver');
var http = require('http');
var server;

var expect = require('chai').expect;

var DASHBOARD_DETAILS = {
  name: 'Some name',
};

describe('Clarityboard Module', function() {
  this.timeout(20000);

  before(function(done) {
    server = http.createServer(mockserver('test/mocks')).listen(9001);
    done();
  });

  after(function(done) {
    server.close(done);
  });

  describe('setApiKey', function() {
    it('uses Bearer auth', function() {
      expect(clarityboard.getApiField('auth')).to.equal('Bearer ' + testUtils.getUserClarityboardKey());
    });
  });

  describe('GetClientUserAgent', function() {
    it('Should return a user-agent serialized JSON object', function() {
      return expect(new Promise(function(resolve, reject) {
        clarityboard.getClientUserAgent(function(c) {
          resolve(JSON.parse(c));
        });
      })).to.eventually.have.property('lang', 'node');
    });
  });

  describe('GetClientUserAgentSeeded', function() {
    it('Should return a user-agent serialized JSON object', function() {
      var userAgent = {lang: 'node'};
      return expect(new Promise(function(resolve, reject) {
        clarityboard.getClientUserAgentSeeded(userAgent, function(c) {
          resolve(JSON.parse(c));
        });
      })).to.eventually.have.property('lang', 'node');
    });

    it('Should URI-encode user-agent fields', function() {
      var userAgent = {lang: 'ï'};
      return expect(new Promise(function(resolve, reject) {
        clarityboard.getClientUserAgentSeeded(userAgent, function(c) {
          resolve(JSON.parse(c));
        });
      })).to.eventually.have.property('lang', '%C3%AF');
    })
  });

  describe('setTimeout', function() {
    it('Should define a default equal to the node default', function() {
      expect(clarityboard.getApiField('timeout')).to.equal(require('http').createServer().timeout);
    });
    it('Should allow me to set a custom timeout', function() {
      clarityboard.setTimeout(900);
      expect(clarityboard.getApiField('timeout')).to.equal(900);
    });
    it('Should allow me to set null, to reset to the default', function() {
      clarityboard.setTimeout(null);
      expect(clarityboard.getApiField('timeout')).to.equal(require('http').createServer().timeout);
    });
  });

  describe('setAppInfo', function() {
    describe('when given nothing or an empty object', function() {
      it('should unset clarityboard._appInfo', function() {
        clarityboard.setAppInfo();
        expect(clarityboard._appInfo).to.be.undefined;
      });
    });

    describe('when given an object with no `name`', function() {
      it('should throw an error', function() {
        expect(function() {
          clarityboard.setAppInfo({});
        }).to.throw(/AppInfo.name is required/);

        expect(function() {
          clarityboard.setAppInfo({
            version: '1.2.3',
          });
        }).to.throw(/AppInfo.name is required/);

        expect(function() {
          clarityboard.setAppInfo({
            cats: '42',
          });
        }).to.throw(/AppInfo.name is required/);
      });
    });

    describe('when given at least a `name`', function() {
      it('should set name, version and url of clarityboard._appInfo', function() {
        clarityboard.setAppInfo({
          name: 'MyAwesomeApp',
        });
        expect(clarityboard._appInfo).to.eql({
          name: 'MyAwesomeApp',
        });

        clarityboard.setAppInfo({
          name: 'MyAwesomeApp',
          url: 'https://myawesomeapp.info',
        });
        expect(clarityboard._appInfo).to.eql({
          name: 'MyAwesomeApp',
          url: 'https://myawesomeapp.info',
        });
      });

      it('should ignore any invalid properties', function() {
        clarityboard.setAppInfo({
          name: 'MyAwesomeApp',
          url: 'https://myawesomeapp.info',
          countOfRadishes: 512,
        });
        expect(clarityboard._appInfo).to.eql({
          name: 'MyAwesomeApp',
          url: 'https://myawesomeapp.info',
        });
      });
    });

    it('should be included in the ClientUserAgent and be added to the UserAgent String', function(done) {
      var appInfo = {
        name: testUtils.getRandomString(),
        url: 'https://myawesomeapp.info',
      };

      clarityboard.setAppInfo(appInfo);

      clarityboard.getClientUserAgent(function(uaString) {
        expect(JSON.parse(uaString).application).to.eql(appInfo);

        expect(clarityboard.getAppInfoAsString()).to.eql(appInfo.name + ' (' + appInfo.url + ')');

        done();
      });
    });
  });

  describe('Callback support', function() {
    describe('Any given endpoint', function() {
      it('Will call a callback if successful', function() {
        return expect(new Promise(function(resolve, reject) {
          clarityboard.dashboards.create(DASHBOARD_DETAILS, function(err, customer) {
            resolve('Called!');
          });
        })).to.eventually.equal('Called!');
      });

      it('Will expose HTTP response object', function() {
        return expect(new Promise(function(resolve, reject) {
          clarityboard.dashboards.create(DASHBOARD_DETAILS, function(err, customer) {
            expect(customer.lastResponse.statusCode).to.equal(200);

            resolve('Called!');
          });
        })).to.eventually.equal('Called!');
      });

      it('Given an error the callback will receive it', function() {
        return expect(new Promise(function(resolve, reject) {
          clarityboard.dashboards.create('something random', DASHBOARD_DETAILS, function(err, customer) {
            if (err) {
              resolve('ErrorWasPassed');
            } else {
              reject(new Error('NoErrorPassed'));
            }
          });
        })).to.eventually.become('ErrorWasPassed');
      });
    });
  });
});
