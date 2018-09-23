'use strict';

// NOTE: testUtils should be require'd before anything else in each spec file!

require('mocha');
// Ensure we are using the 'as promised' libs before any tests are run:
require('chai').use(require('chai-as-promised'));

var ResourceNamespace = require('../lib/ResourceNamespace').ResourceNamespace;

var utils = module.exports = {

  getUserClarityboardKey: function() {
    var key = process.env.CLARITYBOARD_TEST_API_KEY || 'tGN0bIwXnHdwOa85VABjPdSn8nWY7G7I';

    return key;
  },

  getSpyableClarityboard: function() {
    // Provide a testable clarityboard instance
    // That is, with mock-requests built in and hookable

    var clarityboard = require('../lib/clarityboard');
    var clarityboardInstance = clarityboard('fakeAuthToken');

    clarityboardInstance.REQUESTS = [];

    for (var i in clarityboardInstance) {
      makeInstanceSpyable(clarityboardInstance, clarityboardInstance[i]);
    }

    function makeInstanceSpyable(clarityboardInstance, thisInstance) {
      if (thisInstance instanceof clarityboard.ClarityboardResource) {
        patchRequest(clarityboardInstance, thisInstance);
      } else if (thisInstance instanceof ResourceNamespace) {
        var namespace = thisInstance;

        for (var j in namespace) {
          makeInstanceSpyable(clarityboardInstance, namespace[j]);
        }
      }
    }

    function patchRequest(clarityboardInstance, instance) {
      instance._request = function(method, host, url, data, auth, options, cb) {
        var req = clarityboardInstance.LAST_REQUEST = {
          method: method,
          url: url,
          data: data,
          headers: options.headers || {},
        };
        if (auth) {
          req.auth = auth;
        }
        if (host) {
          req.host = host;
        }
        clarityboardInstance.REQUESTS.push(req);
        cb.call(this, null, {});
      };
    }

    return clarityboardInstance;
  },

  /**
   * A utility where cleanup functions can be registered to be called post-spec.
   * CleanupUtility will automatically register on the mocha afterEach hook,
   * ensuring its called after each descendent-describe block.
   */
  CleanupUtility: (function() {
    CleanupUtility.DEFAULT_TIMEOUT = 20000;

    function CleanupUtility(timeout) {
      var self = this;
      this._cleanupFns = [];
      this._clarityboard = require('../lib/clarityboard')(
        utils.getUserClarityboardKey(),
        'latest'
      );
      afterEach(function(done) {
        this.timeout(timeout || CleanupUtility.DEFAULT_TIMEOUT);
        return self.doCleanup(done);
      });
    }

    CleanupUtility.prototype = {

      doCleanup: function(done) {
        var cleanups = this._cleanupFns;
        var total = cleanups.length;
        var completed = 0;
        for (var fn; (fn = cleanups.shift());) {
          var promise = fn.call(this);
          if (!promise || !promise.then) {
            throw new Error('CleanupUtility expects cleanup functions to return promises!');
          }
          promise.then(function() {
            // cleanup successful
            completed += 1;
            if (completed === total) {
              done();
            }
          }, function(err) {
            // not successful
            throw err;
          });
        }
        if (total === 0) {
          done();
        }
      },
      add: function(fn) {
        this._cleanupFns.push(fn);
      },
      deleteCustomer: function(custId) {
        this.add(function() {
          return this._clarityboard.customers.del(custId);
        });
      },
      deletePlan: function(pId) {
        this.add(function() {
          return this._clarityboard.plans.del(pId);
        });
      },
      deleteCoupon: function(cId) {
        this.add(function() {
          return this._clarityboard.coupons.del(cId);
        });
      },
      deleteInvoiceItem: function(iiId) {
        this.add(function() {
          return this._clarityboard.invoiceItems.del(iiId);
        });
      },
    };

    return CleanupUtility;
  }()),

  /**
  * Get a random string for test Object creation
  */
  getRandomString: function() {
    return Math.random().toString(36).slice(2);
  },

  envSupportsForAwait: function() {
    return typeof Symbol !== 'undefined' && Symbol.asyncIterator;
  },

  envSupportsAwait: function() {
    try {
      eval('(async function() {})'); // eslint-disable-line no-eval
      return true;
    } catch (err) {
      return false;
    }
  },

};
