'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Product = mongoose.model('Product'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  product;

/**
 * Product routes tests
 */
describe('Product CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new product
    user.save(function () {
      product = {
        title: 'Product Title',
        content: 'Product Content'
      };

      done();
    });
  });

  it('should not be able to save an product if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/products')
          .send(product)
          .expect(403)
          .end(function (productSaveErr, productSaveRes) {
            // Call the assertion callback
            done(productSaveErr);
          });

      });
  });

  it('should not be able to save an product if not logged in', function (done) {
    agent.post('/api/products')
      .send(product)
      .expect(403)
      .end(function (productSaveErr, productSaveRes) {
        // Call the assertion callback
        done(productSaveErr);
      });
  });

  it('should not be able to update an product if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/products')
          .send(product)
          .expect(403)
          .end(function (productSaveErr, productSaveRes) {
            // Call the assertion callback
            done(productSaveErr);
          });
      });
  });

  it('should be able to get a list of products if not signed in', function (done) {
    // Create new product model instance
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      // Request products
      request(app).get('/api/products')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single product if not signed in', function (done) {
    // Create new product model instance
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      request(app).get('/api/products/' + productObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', product.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single product with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/products/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Product is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single product which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent product
    request(app).get('/api/products/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No product with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an product if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/products')
          .send(product)
          .expect(403)
          .end(function (productSaveErr, productSaveRes) {
            // Call the assertion callback
            done(productSaveErr);
          });
      });
  });

  it('should not be able to delete an product if not signed in', function (done) {
    // Set product user
    product.user = user;

    // Create new product model instance
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      // Try deleting product
      request(app).delete('/api/products/' + productObj._id)
        .expect(403)
        .end(function (productDeleteErr, productDeleteRes) {
          // Set message assertion
          (productDeleteRes.body.message).should.match('User is not authorized');

          // Handle product error error
          done(productDeleteErr);
        });

    });
  });

  it('should be able to get a single product that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new product
          agent.post('/api/products')
            .send(product)
            .expect(200)
            .end(function (productSaveErr, productSaveRes) {
              // Handle product save error
              if (productSaveErr) {
                return done(productSaveErr);
              }

              // Set assertions on new product
              (productSaveRes.body.title).should.equal(product.title);
              should.exist(productSaveRes.body.user);
              should.equal(productSaveRes.body.user._id, orphanId);

              // force the product to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the product
                    agent.get('/api/products/' + productSaveRes.body._id)
                      .expect(200)
                      .end(function (productInfoErr, productInfoRes) {
                        // Handle product error
                        if (productInfoErr) {
                          return done(productInfoErr);
                        }

                        // Set assertions
                        (productInfoRes.body._id).should.equal(productSaveRes.body._id);
                        (productInfoRes.body.title).should.equal(product.title);
                        should.equal(productInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single product if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new product model instance
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      request(app).get('/api/products/' + productObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', product.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single product, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'productowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Product
    var _productOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _productOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Product
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new product
          agent.post('/api/products')
            .send(product)
            .expect(200)
            .end(function (productSaveErr, productSaveRes) {
              // Handle product save error
              if (productSaveErr) {
                return done(productSaveErr);
              }

              // Set assertions on new product
              (productSaveRes.body.title).should.equal(product.title);
              should.exist(productSaveRes.body.user);
              should.equal(productSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the product
                  agent.get('/api/products/' + productSaveRes.body._id)
                    .expect(200)
                    .end(function (productInfoErr, productInfoRes) {
                      // Handle product error
                      if (productInfoErr) {
                        return done(productInfoErr);
                      }

                      // Set assertions
                      (productInfoRes.body._id).should.equal(productSaveRes.body._id);
                      (productInfoRes.body.title).should.equal(product.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (productInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Product.remove().exec(done);
    });
  });
});
