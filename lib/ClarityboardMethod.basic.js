'use strict';

var clarityboardMethod = require('./ClarityboardMethod');

module.exports = {

  create: clarityboardMethod({
    method: 'POST',
  }),

  list: clarityboardMethod({
    method: 'GET',
    methodType: 'list',
  }),

  retrieve: clarityboardMethod({
    method: 'GET',
    path: '/{id}',
    urlParams: ['id'],
  }),

  update: clarityboardMethod({
    method: 'POST',
    path: '{id}',
    urlParams: ['id'],
  }),

  // Avoid 'delete' keyword in JS
  del: clarityboardMethod({
    method: 'DELETE',
    path: '{id}',
    urlParams: ['id'],
  }),

};
