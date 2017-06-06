'use strict';

/**
 * Module dependencies
 */
var productsPolicy = require('../policies/products.server.policy.js'),
  products = require('../controllers/products.server.controller.js');

module.exports = function (app) {
  // Products collection routes
  app.route('/api/products').all(productsPolicy.isAllowed)
    .get(products.list)
    .post(products.create);

  // Single product routes
  app.route('/api/products/:productId').all(productsPolicy.isAllowed)
    .get(products.read)
    .put(products.update)
    .delete(products.delete);

  // Finish by binding the product middleware
  app.param('productId', products.productByID);
};
