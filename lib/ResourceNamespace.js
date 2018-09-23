'use strict';

// ResourceNamespace allows you to create nested resources, i.e. `clarityboard.issuing.cards`.
// It also works recursively, so you could do i.e. `clarityboard.billing.invoicing.pay`.

function ResourceNamespace(clarityboard, resources) {
  for (var name in resources) {
    var camelCaseName = name[0].toLowerCase() + name.substring(1);

    var resource = new resources[name](clarityboard);

    this[camelCaseName] = resource;
  }
}

module.exports = function(namespace, resources) {
  return function (clarityboard) {
    return new ResourceNamespace(clarityboard, resources);
  };
};

module.exports.ResourceNamespace = ResourceNamespace;
