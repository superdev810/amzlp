'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  isAWSAccountId = require('is-aws-account-id'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findOne({
    _id: id
  }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load User ' + id));
    }

    req.profile = user;
    next();
  });
};

exports.validAWSAccountId = function(req, res){
  console.log(req.body);
  var aws_id = req.body.awsId;
  return res.json({valid: isAWSAccountId(aws_id)});
}
