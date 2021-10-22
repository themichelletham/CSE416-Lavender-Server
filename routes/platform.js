const express = require("express");
const router = express.Router();
const sequelize = require('sequelize');
const { Platforms } = require ("../models");


router.get("/", (req, res) =>{
    res.send("Hello platforms");
});

router.get('/:platform_id/', async (req, res) => {
    res.send('Create Platform')
    //const platform = await Platorms.findOne({ where: { platform_id: req.params.platform_id } })
    //    .catch( err => {
    //        console.log('Get Platform error: ', err);
    //    });
    //if(platform == null)
    //    res.sendStatus(404);
    //res.json(platform);
});

router.put('/:platform_id/creator', async (req, res) => {
    res.send('Platform Update');
    //const platform = req.body;
    //await Platforms.update(platform, {
    //    where: {
    //        platform_id: platform.platform_id
    //    }
    //}).catch( err => {
    //    console.log('PUT Platform error: ', err);
    //    res.sendStatus(404);
    //});
    //res.sendStatus(200);
});

router.get('/:platform_id/search', async (req, res) => {
    res.send('Platform Quiz Search');
    //const platform = await Platforms.findOne({ 
    //    where: { 
    //        platform_id: req.params.platform_id 
    //    } 
    //}).catch( err => {
    //    console.log('GET Platform Search: ', err);
    //});
    //if(platform == null)
    //    res.sendStats(404);
    //const search_results = await platform.getQuizzes({
    //    where: {
    //        quiz_name: sequelize.where(
    //            sequelize.fn('LOWER', sequelize.col('quiz_name')),
    //            'LIKE',
    //            `%${req.query.query}%`
    //        )
    //    }
    //});
    //res.json(search_results)
});

module.exports = router;
