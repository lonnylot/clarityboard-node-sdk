'use strict';

var ClarityboardResource = require('../ClarityboardResource');

module.exports = ClarityboardResource.extend({

  path: 'reports',
  includeBasic: [
    'create'
  ],
});
