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
describe('Product Admin CRUD tests', function () {
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
      roles: ['user', 'admin'],
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

  it('should be able to save an product if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(200)
          .end(function (productSaveErr, productSaveRes) {
            // Handle product save error
            if (productSaveErr) {
              return done(productSaveErr);
            }

            // Get a list of products
            agent.get('/api/products')
              .end(function (productsGetErr, productsGetRes) {
                // Handle product save error
                if (productsGetErr) {
                  return done(productsGetErr);
                }

                // Get products list
                var products = productsGetRes.body;

                // Set assertions
                (products[0].user._id).should.equal(userId);
                (products[0].title).should.match('Product Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an product if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(200)
          .end(function (productSaveErr, productSaveRes) {
            // Handle product save error
            if (productSaveErr) {
              return done(productSaveErr);
            }

            // Update product title
            product.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing product
            agent.put('/api/products/' + productSaveRes.body._id)
              .send(product)
              .expect(200)
              .end(function (productUpdateErr, productUpdateRes) {
                // Handle product update error
                if (productUpdateErr) {
                  return done(productUpdateErr);
                }

                // Set assertions
                (productUpdateRes.body._id).should.equal(productSaveRes.body._id);
                (productUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an product if no title is provided', function (done) {
    // Invalidate title field
    product.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(422)
          .end(function (productSaveErr, productSaveRes) {
            // Set message assertion
            (productSaveRes.body.message).should.match('Title cannot be blank');

            // Handle product save error
            done(productSaveErr);
          });
      });
  });

  it('should be able to delete an product if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(200)
          .end(function (productSaveErr, productSaveRes) {
            // Handle product save error
            if (productSaveErr) {
              return done(productSaveErr);
            }

            // Delete an existing product
            agent.delete('/api/products/' + productSaveRes.body._id)
              .send(product)
              .expect(200)
              .end(function (productDeleteErr, productDeleteRes) {
                // Handle product error error
                if (productDeleteErr) {
                  return done(productDeleteErr);
                }

                // Set assertions
                (productDeleteRes.body._id).should.equal(productSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single product if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new product model instance
    product.user = user;
    var productObj = new Product(product);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(200)
          .end(function (productSaveErr, productSaveRes) {
            // Handle product save error
            if (productSaveErr) {
              return done(productSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (productInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
