const express = require("express");
const router = express.Router();
const { Quizzes } = require ("../models");


router.get("/", (req, res) =>{
    res.send("Hello search");
});

module.exports = router
