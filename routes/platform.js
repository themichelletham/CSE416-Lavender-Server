const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../auth/middlewares");
const { Op } = require("sequelize");
const { Quizzes, Platforms, Users } = require("../models");

router.get("/", async (req, res) => {
  const quizzes = await Quizzes.findAll();
  const platforms = await Platforms.findAll();
  res.status(200).send({ quizzes: quizzes, platforms: platforms });
});

router.post("/", isAuthenticated, async (req, res) => {
  const user = req.user;
  const platform = await user.getPlatform()
    .catch(err => {
      console.log("Creating Platform");
    });
  if(platform !== null) {
    res.sendStatus(400);
    return;
  }
  const platform_fields = req.body.platform_fields;
  const new_platform = await Platforms.create(platform_fields).catch((err) => {
    console.log("POST Platform: ", err);
  });
  res.status(201).json(new_platform);
});

router.get('/:platform_id', async (req, res) => {
  const keyword = req.query.keyword;
  const platform = await Platforms.findOne({
    where: { platform_id: req.params.platform_id },
  }).catch((err) => {
    console.log("Get Platform error: ", err);
  });
  if (platform == null) {
    res.sendStatus(404);
    return;
  }

  const quizzes = await platform
    .getQuizzes({
      where: {
        quiz_name: {
          [Op.like]: "%" + keyword + "%",
        },
        is_published: true,
      },
      order: [["createdAt", "DESC"]]
    })
    .catch((err) => {
      console.log("Get Platform Quizzes error: ", err);
    });
  if (quizzes == null) {
    res.sendStatus(404);
    return;
  }
  const points = await platform
    .getPoints({
      limit: 5,
      order: [["points", "DESC"]],
    })
    .catch((err) => {
      console.log("GET Platforms Points: ", err);
    });

  if (points === null) {
    res.sendStatus(500);
    return;
  }
  const topusers = [];
  for (let i = 0; i < points.length; ++i) {
    const user = await Users.findOne({
      where: {
        user_id: points[i].user_id,
      },
    }).catch((err) => {
      console.log("GET Platforms Points User: ", err);
    });
    if (user === null) {
      res.sendStatus(500);
      return;
    }
    topusers.push(user);
  }
  res.json({
    platform_name: platform.platform_name,
    user_id: platform.user_id,
    icon_photo: platform.icon_photo,
    banner_photo: platform.banner_photo,
    quizzes: quizzes,
    topFiveUsers: topusers,
  });
});

router.get("/:platform_id/creator", isAuthenticated, async (req, res) => {
  const user = req.user;
  const keyword = req.query.keyword;
  const platform = await user.getPlatform()
    .catch(err => {
      console.log("Get Platform error: ", err);
    });
  if (platform === null || platform.platform_id != req.params.platform_id) {
    res.sendStatus(403);
    return;
  }

  const quizzes = await platform
    .getQuizzes({
      where: {
        quiz_name: {
          [Op.like]: "%" + keyword + "%",
        },
      },
      order: [["createdAt", "DESC"]]
    })
    .catch((err) => {
      console.log("Get Platform Quizzes error: ", err);
    });
  if (quizzes == null) {
    res.sendStatus(404);
    return;
  }
  const points = await platform
    .getPoints({
      limit: 5,
      order: [["points", "DESC"]],
    })
    .catch((err) => {
      console.log("GET Platforms Points: ", err);
    });

  if (points === null) {
    res.sendStatus(500);
    return;
  }
  const topusers = [];
  for (let i = 0; i < points.length; ++i) {
    const user = await Users.findOne({
      where: {
        user_id: points[i].user_id,
      },
    }).catch((err) => {
      console.log("GET Platforms Points User: ", err);
    });
    if (user === null) {
      res.sendStatus(500);
      return;
    }
    topusers.push(user);
  }
  res.json({
    platform_name: platform.platform_name,
    user_id: platform.user_id,
    icon_photo: platform.icon_photo,
    banner_photo: platform.banner_photo,
    quizzes: quizzes,
    topFiveUsers: topusers,
  });
});

router.delete("/:platform_id", async (req, res) => {
  //res.send('Deletes Quiz');
  const platform_id = req.params.platform_id;
  const platform = await Platforms.findOne({
    where: { platform_id: platform_id },
  }).catch((err) => {
    console.log("DELETE Platform: ", err);
  });
  if (platform != null) {
    await platform.destroy().catch((err) => {
      console.log("DELETE PLATFORM: ", err);
    });
  }
  res.sendStatus(204);
});

router.put("/:platform_id/creator", isAuthenticated, async (req, res) => {
  const user = req.user;
  const platform = await user.getPlatform();
  if (platform.platform_id != req.params.platform_id) {
    res.sendStatus(403);
    return;
  }

  const platform_fields = {};
  platform_fields.platform_name = req.body.platform_fields.platform_name;
  await Platforms.update(platform_fields, {
    where: {
      platform_id: req.params.platform_id,
    },
  }).catch((err) => {
    console.log("PUT Platform error: ", err);
  });
  res.sendStatus(200);
  return;
});

router.put("/:platform_id/image-upload", async (req, res) => {
  //res.send('Platform Update');
  const platform_fields = req.body.platform_fields;

  await Platforms.update(platform_fields, {
    where: {
      platform_id: req.params.platform_id,
    },
  }).catch((err) => {
    console.log("PUT Platform error: ", err);
  });
  res.sendStatus(200);

  return;
});

router.get("/:platform_id/get-image", async (req, res) => {
  // res.send('Create Platform')
  const platform = await Platforms.findOne({
    where: { platform_id: req.params.platform_id },
  }).catch((err) => {
    console.log("Get Platform error: ", err);
  });
  if (platform == null) {
    res.sendStatus(404);
    return;
  }

  res.json({
    icon_photo: platform.icon_photo,
    banner_photo: platform.banner_photo,
  });
});

router.get("/:platform_id/quizzes", async (req, res) => {
  const platformQuizzes = await Quizzes.findAll({
    where: { platform_id: req.params.platform_id },
  }).catch((err) => {
    console.log("Get Platform error: ", err);
  });
  if (platformQuizzes == null) {
    res.sendStatus(404);
    return;
  }
  res.json(platformQuizzes);
});

router.get("/:platform_id/search", async (req, res) => {
  res.send("Platform Quiz Search");
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
