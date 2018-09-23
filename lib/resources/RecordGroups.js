'use strict';

var ClarityboardResource = require('../ClarityboardResource');
var clarityboardMethod = ClarityboardResource.method;

module.exports = ClarityboardResource.extend({

  path: 'records/groups',
  includeBasic: [
    'list'
  ],

  update: clarityboardMethod({
    method: 'PUT',
  }),
});
