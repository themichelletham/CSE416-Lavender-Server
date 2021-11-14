const express = require("express");
const router = express.Router();
const { Quizzes, Platforms } = require("../models");
const { Op } = require("sequelize");

router.get("/:keyword", async (req, res) => {
  //res.send("Platform Quiz Search");
  keyword = req.params.keyword;
  const platforms = await Platforms.findAll({
    where: {
      platform_name: {
        [Op.like]: "%" + keyword + "%",
      },
    },
  });
  const quizzes = await Quizzes.findAll({
    where: {
      quiz_name: {
        [Op.like]: "%" + keyword + "%",
      },
    },
  });

  res.json({ platforms: platforms, quizzes: quizzes });
});

module.exports = router;
