'use strict';

var ClarityboardResource = require('../ClarityboardResource');

module.exports = ClarityboardResource.extend({

  path: 'dashboards',
  includeBasic: [
    'create', 'list', 'retrieve'
  ],
});
