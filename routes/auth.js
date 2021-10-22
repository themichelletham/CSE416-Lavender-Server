const express = require("express");
const router = express.Router();
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { User } = require ("../models");

router.get("/", (req, res) =>{
    res.send("Hello auth");
});

module.exports = router;
