const express = require("express");
const passport = require('passport')
const { isAuthenticated } = require("../auth/middlewares");
const router = express.Router();
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
//const passport = require('passport')
//const GoogleStrategy = require('passport-google-oauth20').Strategy
const { Users } = require ("../models");

require('../auth/googleSSO');

router.get('/google/callback',
  passport.authenticate('google', {
    failureMessage: 'cannot login to Google, please try again',
    failureRedirect: config.googleFailuerRedirectUrl,
    successRedirect: config.googleSuccessRedirectUrl
  }), (req, res) => {
    res.send('Callback Success');
  });

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/logout', (req, res) => {
  req.logout();
  res.send('Logout Success');
});

router.get('/user', isAuthenticated, (req, res) => {
  res.json(req.user);
})

module.exports = router;
