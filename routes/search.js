const express = require("express");
const router = express.Router();
const { Quizzes, Platforms } = require("../models");
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
  const quizzes = await Quizzes.findAll();
  const platforms = await Platforms.findAll();
  res.status(200).send({ quizzes: quizzes, platforms: platforms });
});

router.get("/:keyword", async (req, res) => {
  //res.send("Platform Quiz Search");
  const keyword = req.params.keyword;
  let quizzes = null;
  let platforms = null;
  if (keyword == "undefined") {
    quizzes = await Quizzes.findAll();
    platforms = await Platforms.findAll();
  } else {
    platforms = await Platforms.findAll({
      where: {
        platform_name: {
          [Op.like]: "%" + keyword + "%",
        },
      },
    });
    quizzes = await Quizzes.findAll({
      where: {
        quiz_name: {
          [Op.like]: "%" + keyword + "%",
        },
      },
    });
  }
  res.json({ platforms: platforms, quizzes: quizzes });
});

module.exports = router;
