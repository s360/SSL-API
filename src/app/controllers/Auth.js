'use strict';
/**
 *
 * @type {Passport|exports|module.exports}
 */
// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var User = require('../models/User');
var Client = require('../models/Client');
var Access = require('../access/access');
var Token = require('../models/Token');
var tokenHash = require('../../lib/utils').tokenHash;

passport.use(new BasicStrategy(
    
  function(username, password, callback) {

    User.findOne({ email: username }, function (err, user) {

      if (err) { return callback(err); }

      // No user found with that username
      if (!user) { return callback(null, false); }

      // Make sure the password is correct
      user.verifyPassword(password, function(err, isMatch) {

        if (err) { return callback(err); }

        // Password did not match
        if (!isMatch) { return callback(null, false); }

        // Success
        return callback(null, user);

      });

    });

  }

));


passport.use(new BearerStrategy(

  function(accessToken, callback) {

    var accessTokenHash = tokenHash(accessToken);

    Token.findOne({ token: accessTokenHash }, function (err, token) {

      if (err) { return callback(err); }

      // No token found
      if (!token) {
        return callback(null, false);
      }

      //check for expired token
      if (new Date() > token.expired) {

        token.remove(function (err) {

          if (err) { return callback(err); }

          callback(null, false, { message: 'Token expired' });

        });


      } else {

        User.findOne({ _id: token.userId }, function (err, user) {

          if (err) { return callback(err); }

          // No user found
          if (!user) { return callback(null, false); }

          // Simple example with no scope
          callback(null, user, { scope: '*' });

        });

      }

    });

  }

));

/**
 * Middleware function for check authorize
 */
exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });

exports.hasAccess = Access.hasAccess;

exports.isAdmin = Access.isAdmin;

exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });