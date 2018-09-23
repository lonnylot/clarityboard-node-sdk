# Clarityboard Node.js Library

[![Version](https://img.shields.io/npm/v/clarityboard.svg)](https://www.npmjs.org/package/clarityboard)
[![Downloads](https://img.shields.io/npm/dm/clarityboard.svg)](https://www.npmjs.com/package/clarityboard)

The Clarityboard Node library provides convenient access to the Clarityboard API from
applications written in server-side JavaScript.

This library is heavily influenced by the [Stripe Node.js Library](http://github.com/stripe/stripe-node)

Please keep in mind that this package is for use with server-side Node that
uses Clarityboard keys. This package should not be used for client-side code.

## Documentation

See the [API docs](https://clarityboard.docs.apiary.io/).

## Installation

Install the package with:

    npm install clarityboard --save

## Usage

The package needs to be configured with your account's master key which is
available in your [Clarityboard API Settings][api-keys]. Require it with the key's
value:

``` js
var clarityboard = require('clarityboard')('your_key...');

var dashboard = await clarityboard.dashboards.create(
  { name: 'My Example Dashboard' }
);
```

Or with versions of Node.js prior to v7.9:

``` js
var clarityboard = require('clarityboard')('your_key...');

clarityboard.dashboards.create(
  { name: 'My Example Dashboard' },
  function(err, dashboard) {
    err; // null if no error occurred
    dashboard; // the created dashboard object
  }
);
```

Or using ES modules, this looks more like:

``` js
import clarityboardPackage from 'clarityboard';
const clarityboard = clarityboardPackage('your_key...');
//…
```


Or using TypeScript:

``` ts
import * as Clarityboard from 'clarityboard';
const clarityboard = new Clarityboard('your_key...');
//…
```

### Using Promises

Every method returns a chainable promise which can be used instead of a regular
callback:

``` js
// Create a new dashboard and then a new report for that dashboard:
clarityboard.dashboards.create({
  name: 'My Example Dashboard'
}).then(function(dashboard){
  return clarityboard.reports.create({
    dashboardId: dashboard.id,
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
}).then(function(charge) {
  // New charge created on a new customer
}).catch(function(err) {
  // Deal with an error
});
```

### Configuring Timeout

Request timeout is configurable (the default is Node's default of 120 seconds):

``` js
clarityboard.setTimeout(20000); // in ms (this is 20 seconds)
```


### Configuring a Proxy

An [https-proxy-agent][https-proxy-agent] can be configured with
`setHttpAgent`.

To use clarityboard behind a proxy you can pass  to sdk:

```js
if (process.env.http_proxy) {
  const ProxyAgent = require('https-proxy-agent');
  clarityboard.setHttpAgent(new ProxyAgent(process.env.http_proxy));
}
```

### Examining Responses

Some information about the response which generated a resource is available
with the `lastResponse` property:

```js
charge.lastResponse.statusCode
```

### `request` and `response` events

The Clarityboard object emits `request` and `response` events.  You can use them like this:

```js
var clarityboard = require('clarityboard')('your_key...');

function onRequest(request) {
  // Do something.
}

// Add the event handler function:
clarityboard.on('request', onRequest);

// Remove the event handler function:
clarityboard.off('request', onRequest);
```

#### `request` object
```js
{
  method: 'POST',
  path: '/v/dashboards'
}
```

#### `response` object
```js
{
  method: 'POST',
  path: '/v/dashboards',
  status: 200
}
```

### Writing a Plugin

If you're writing a plugin that uses the library, we'd appreciate it if you identified using `clarityboard.setAppInfo()`:

```js
clarityboard.setAppInfo({
  name: 'MyAwesomePlugin',
  version: '1.2.34', // Optional
  url: 'https://myawesomeplugin.info', // Optional
});
```

This information is passed along when the library makes calls to the Clarityboard API.

## More Information

 * [Error Handling](https://github.com/stripe/stripe-node/wiki/Error-Handling)
 * [Passing Options](https://github.com/stripe/stripe-node/wiki/Passing-Options)

## Development

Run all tests:

```bash
$ npm install
$ npm test
```

Run a single test suite:

```bash
$ npm run mocha -- test/Error.spec.js
```

Run a single test (case sensitive):

```bash
$ npm run mocha -- test/Error.spec.js --grep 'Populates with type'
```

[api-keys]: https://www.clarityboard.com/settings#/api
[https-proxy-agent]: https://github.com/TooTallNate/node-https-proxy-agent

<!--
# vim: set tw=79:
-->
