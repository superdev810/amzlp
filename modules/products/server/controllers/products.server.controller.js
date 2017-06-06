'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var await = require('await');
const util = require('util')
const xmlParser = require('xml2json')
const OperationHelper = require('apac').OperationHelper

const operation = 'ItemSearch'


var params = {
  'SearchIndex': 'Books',
  'Keywords': 'Kids sports',
  'Condition': 'All',
  'ItemPage' : 3,
  'ResponseGroup': 'ItemAttributes,Offers'
};


/**
 * Create an product
 */
exports.create = function (req, res) {
  var product = new Product(req.body);
  product.user = req.user;

  product.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

/**
 * Show the current product
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var product = req.product ? req.product.toJSON() : {};

  // Add a custom field to the Product, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Product model.
  product.isCurrentUserOwner = !!(req.user && product.user && product.user._id.toString() === req.user._id.toString());

  res.json(product);
};

/**
 * Update an product
 */
exports.update = function (req, res) {
  var product = req.product;

  product.title = req.body.title;
  product.content = req.body.content;

  product.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

/**
 * Delete an product
 */
exports.delete = function (req, res) {
  var product = req.product;

  product.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

/**
 * List of Products
 */
exports.list = function (req, res) {

  var products;
  // or if you have async/await support...

  var queryParams = {
    'SearchIndex': 'Books',
    'Keywords': 'Kids sports',
    'Condition': 'All',
    'ItemPage' : 3,
    'ResponseGroup': 'ItemAttributes,Offers'
  };

  const opHelper = new OperationHelper({
    awsId: req.user.awsId,
    awsSecret: req.user.awsSecret,
    assocId: req.user.assocId
  })

  try {
    let response = await
    opHelper.execute(operation, params)
    console.log('Result')
    //console.log(response.responseBody)
    //return null;
  } catch(err) {
    console.error(err)
    //return null;
  }

//// traditional callback style is also supported for backwards compatibility
//
//  return new Promise(function (resolve, reject) {
  console.log(operation);
  console.log(queryParams);

  opHelper.execute(operation, queryParams, function (err, results) {
    if(err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {
      console.log('Asyn Support');
      console.log(results.ItemSearchResponse);
      console.log(req.user);
      return res.json(results.ItemSearchResponse == undefined ? [] : results.ItemSearchResponse.Items.Item);
    }
  })
  //})


  //Product.find().sort('-created').populate('user', 'displayName').exec(function (err, products) {
  //  if (err) {
  //    return res.status(422).send({
  //      message: errorHandler.getErrorMessage(err)
  //    });
  //  } else {
  //    res.json(products);
  //  }
  //});
};

/**
 * Product middleware
 */
exports.productByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Product is invalid'
    });
  }

  Product.findById(id).populate('user', 'displayName').exec(function (err, product) {
    if (err) {
      return next(err);
    } else if (!product) {
      return res.status(404).send({
        message: 'No product with that identifier has been found'
      });
    }
    req.product = product;
    next();
  });
};

/**
 * Product Advertising API to get all products
 */
function getProductsWithParam(searchQuery, param)
{
  // or if you have async/await support...

  try {
    let response = await
    opHelper.execute(operation, params)
    console.log(response.results)
    console.log(response.responseBody)
    //return null;
  } catch(err) {
    console.error(err)
    //return null;
  }

//// traditional callback style is also supported for backwards compatibility
//
//  return new Promise(function (resolve, reject) {
    console.log(operation);
    console.log(queryParams);
    opHelper.execute(searchQuery, queryParams, function (err, results) {
      if(err)
        console.log(err);

      console.log('Asyn Support');
      console.log(results);
      //resolve();
      //return results;
    })
  //})
}
