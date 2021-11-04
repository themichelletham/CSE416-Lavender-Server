const express = require("express");
const router = express.Router();
const sequelize = require('sequelize');
const { Quizzes, Platforms } = require("../models");


router.get("/", (req, res) => {
  res.send("Hello platforms");
});

router.post("/", async (req, res) => {
  console.log("Hello platforms");
  const platform_fields = req.body.platform_fields;
  const platform = await Platforms.create(platform_fields)
    .catch(err => {
      console.log('POST Platform: ', err);
    });
  res.status(201).send(platform);
});

router.get('/:platform_id/', async (req, res) => {
  // res.send('Create Platform')
  const platform = await Platforms.findOne({ where: { platform_id: req.params.platform_id } })
    .catch(err => {
      console.log('Get Platform error: ', err);
    });
  if (platform == null) {
    res.sendStatus(404);
    return;
  }
  res.json(platform);
});

router.delete('/:platform_id', async (req, res) => {
    //res.send('Deletes Quiz');
    const platform_id = req.params.platform_id;
    const platform = await Platforms.findOne({ where: { platform_id: platform_id } })
      .catch(err => {
        console.log('DELETE Platform: ', err);
      })
    if (platform != null) {
      await platform.destroy()
        .catch(err => {
          console.log('DELETE PLATFORM: ', err);
        })
    }
    res.sendStatus(204);
  });

router.put('/:platform_id/creator', async (req, res) => {
  //res.send('Platform Update');
  const platform_fields = req.body.platform_fields;
  await Platforms.update(platform_fields, {
    where: {
      platform_id: req.params.platform_id
    }
  }).catch(err => {
    console.log('PUT Platform error: ', err);
  });
  res.sendStatus(200);
});


router.get('/:platform_id/quizzes', async (req, res) => {

  const platformQuizzes = await Quizzes.findAll({ where: { platform_id: req.params.platform_id } })
    .catch(err => {
      console.log('Get Platform error: ', err);
    });
  if (platformQuizzes == null) {
    res.sendStatus(404);
    return;
  }
  res.json(platformQuizzes);
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
