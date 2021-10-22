const express = require("express");
const router = express.Router();
const { Users } = require ("../models");


router.get("/", async (req, res) =>{
    res.send('GET All Users');
    //const listOfUsers = await Users.findAll();
    //res.json(listOfUsers);
});

router.post("/", async (req, res) =>{
    res.send('POST User');
    //const user = req.body;
    //await Users.create(user);
    //res.json(user);
});

router.get('/:user_id', async (req, res) => {
    res.send(`GET User by ID ${req.params.user_id}`);
    //const user = await Users.findOne({ where: { user_id: req.params.user_id } })
    //    .catch( err => {
    //        console.log('Get User error: ', err);
    //        res.sendStatus(500);
    //    });
    //if(user == null) 
    //    res.sendStatus(404);
    //res.json(user);
});

module.exports = router;
