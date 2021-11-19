const express = require("express");
const { isAuthenticated } = require("../auth/middlewares");
const router = express.Router();
const {
  Quizzes,
  Answers,
  Questions,
  History,
  Points,
  UserAnswers,
  Platforms,
  Users,
} = require("../models");

router.get("/", async (req, res) => {
  const quizzes = await Quizzes.findAll();
  res.status(200).send(quizzes);
});

router.post("/", isAuthenticated, async (req, res) => {
  //res.send("Hello quizzes");
  const platform = await Platforms.findOne({
    where: {
      platform_id: req.body.quiz_fields.platform_id,
    },
  }).catch((err) => {
    console.log("authUserIsCreating", err);
    res.status(500);
  });

  if (platform.user_id !== req.body.user_id) {
    res.sendStatus(401);
    return;
  }

  const quiz_fields = req.body.quiz_fields;
  const quiz = await Quizzes.create(quiz_fields).catch((err) => {
    console.log("POST Quiz: ", err);
  });
  const question = await Questions.create({
    quiz_id: quiz.quiz_id,
    question_text: "New Question",
  }).catch((err) => {
    console.log("POST Quiz question: ", err);
  });
  if (question === null) {
    res.sendStatus(500);
    return;
  }
  const answer1 = await Answers.create({
    question_id: question.question_id,
    answer_text: "New Answer",
    is_correct: true,
  }).catch((err) => {
    console.log("POST Quiz answer1: ", err);
  });
  if (answer1 === null) {
    res.sendStatus(500);
    return;
  }
  const answer2 = await Answers.create({
    question_id: question.question_id,
    answer_text: "New Answer",
    is_correct: false,
  }).catch((err) => {
    console.log("Post Quiz answer1: ", err);
  });
  if (answer2 === null) {
    res.sendStatus(500);
    return;
  }
  res.status(201).json({ platform: platform, quiz: quiz });
});

// termporary path
router.post("/:quiz_id/history", async (req, res) => {
  const quiz_id = req.params.quiz_id;
  if (req.body.user_id === null) {
    res.sendStatus(400);
    return;
  }
  const user_id = req.body.user_id;
  const history = await History.findOne({
    where: { quiz_id: quiz_id, user_id: user_id },
  }).catch((err) => {
    console.log("POST quiz history: ", err);
  });
  if (history !== null) {
    res.status(200).json({ history: history });
    return;
  }
  res.sendStatus(404);
});

router.delete("/:quiz_id", async (req, res) => {
  const quiz_id = req.params.quiz_id;
  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } }).catch(
    (err) => {
      console.log("DELETE Quiz: ", err);
    }
  );
  if (quiz != null) {
    await quiz.destroy().catch((err) => {
      console.log("DELETE QUIZ: ", err);
    });
  }
  res.sendStatus(204);
});

router.get("/:quiz_id", async (req, res) => {
  const quiz_id = req.params.quiz_id;

  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } }).catch(
    (err) => {
      console.log("GET QUIZ: ", err);
    }
  );
  if (quiz == null) res.sendStatus(404);
  else {
    const questions = await quiz.getQuestions();
    let answers = [];
    for (let i = 0; i < questions.length; ++i) {
      let answer_list = await questions[i].getAnswers();
      answers.push(answer_list);
    }
    const platform = await quiz.getPlatform();
    res.json({
      platform: platform,
      quiz: quiz,
      questions: questions,
      answers: answers,
      icon_photo: platform.icon_photo,
    });
  }
});

router.post("/:quiz_id/results", async (req, res) => {
  const quiz_id = req.params.quiz_id;
  const user_id = req.body.user_id;
  const platform_id = req.body.platform_id;
  const selected_answers = req.body.selected_answers;
  const duration = req.body.duration;

  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } }).catch(
    (err) => {
      console.log("POST Quiz Results: ", err);
    }
  );
  if (quiz == null) {
    res.sendStatus(500);
    return;
  }

  // Calculating points score
  const questions = await quiz.getQuestions();
  let n_correct = 0;
  for (let i = 0; i < questions.length; ++i) {
    const answers = await questions[i].getAnswers({
      order: [["answer_id", "ASC"]],
    });
    if (answers == null) {
      res.sendStatus(500);
      return;
    }
    if (answers[selected_answers[i]].is_correct) n_correct++;
  }
  const multiplier = duration === null ? 1 : quiz.time_limit / duration;
  const points = n_correct * multiplier;

  // Create or update points for user on specific platform
  if (user_id !== null) {
    const user = await Users.findOne({
      where: {
        user_id: user_id,
      },
    }).catch((err) => {
      console.log("POST Quiz Results; User: ", err);
      res.sendStatus(500);
      return;
    });
    if (user !== null) {
      user.points = user.points + points;
      await user.save();
    }
    var points_rec = await Points.findOne({
      where: {
        user_id: user_id,
        platform_id: platform_id,
      },
    }).catch((err) => {
      console.log("Post Quiz Results: Points: ", err);
      res.sendStatus(500);
      return;
    });
    if (points_rec !== null) {
      points_rec.points = points_rec.points + points;
      await points_rec.save();
    } else {
      points_rec = await Points.create({
        user_id: user_id,
        platform_id: platform_id,
        points: points,
      }).catch((err) => {
        console.log("POST Quiz Results, Points: ", err);
      });
    }

    // Create user records for previous answers
    for (let i = 0; i < selected_answers.length; ++i) {
      const user_answer = await UserAnswers.create({
        question_id: questions[i].question_id,
        user_id: user_id,
        quiz_id: quiz_id,
        answer_idx: selected_answers[i],
      });
      if (user_answer === null) {
        res.sendStatus(500);
        return;
      }
    }

    // Create new history of user taking the quiz
    const new_history = await History.create({
      user_id: user_id,
      quiz_id: quiz_id,
      points: points,
    }).catch((err) => {
      console.log("POST Quiz Results: ", err);
    });
    if (new_history == null) {
      res.sendStatus(500);
      return;
    }
  }
  res.status(201).send(points_rec);
});

router.put("/:quiz_id/creator", async (req, res) => {
  const quiz_id = req.params.quiz_id;
  const updates = req.body.quiz_fields;
  await Quizzes.update(updates, {
    where: {
      quiz_id: quiz_id,
    },
  }).catch((err) => {
    console.log("PUT quiz creator: ", err);
    res.sendStatus(404);
  });
});

router.post("/:quiz_id/view-results", async (req, res) => {
  //res.send(`Gets Quiz by Id: ${req.params.quiz_id}`);
  const user_id = req.body.user_id;
  const quiz_id = req.params.quiz_id;
  const platform_id = req.body.platform_id;

  const history = await History.findOne({
    where: { quiz_id: quiz_id, user_id: user_id },
  }).catch((err) => {
    console.log("GET HISTORY", err);
  });

  if (history == null) {
    res.sendStatus(404);
    return;
  }

  const points = await Points.findOne({
    where: { platform_id: platform_id, user_id: user_id },
  }).catch((err) => {
    console.log("GET POINTS", err);
  });

  const user_answers = await UserAnswers.findAll({
    where: { quiz_id: quiz_id, user_id: user_id },
    order: [["question_id", "ASC"]],
  }).catch((err) => {
    console.log("GET USER ANSWERS", err);
  });
  let selected_answers = [];
  for (let i = 0; i < user_answers.length; ++i) {
    selected_answers.push(user_answers[i].answer_idx);
  }

  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } }).catch(
    (err) => {
      console.log("GET QUIZ: ", err);
    }
  );
  if (quiz == null) res.sendStatus(404);
  else {
    const questions = await quiz.getQuestions({
      order: [["question_id", "ASC"]],
    });
    //console.log(questions)
    let answers = [];
    for (let i = 0; i < questions.length; ++i) {
      let answer_list = await questions[i].getAnswers({
        order: [["answer_id", "ASC"]],
      });
      answers.push(answer_list);
    }
    const platform = await quiz.getPlatform();
    //console.log(answers)
    res.json({
      platform: platform,
      quiz: quiz,
      questions: questions,
      answers: answers,
      selected_answers: selected_answers,
      points: points,
    });
  }
});

router.post("/:quiz_id/view-results-unauth", async (req, res) => {
  const quiz_id = req.params.quiz_id;
  const platform_id = req.body.platform_id;
  const selected_answers = req.body.selected_answers;
  const duration = req.body.duration;

  const platform = await Platforms.findOne({
    where: {
      platform_id: platform_id,
    },
  }).catch((err) => {
    console.log("get plat for unauthenticated user", err);
    res.status(500);
  });

  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } }).catch(
    (err) => {
      console.log("POST Quiz Results: ", err);
    }
  );
  if (quiz == null) {
    res.sendStatus(500);
    return;
  }

  // Calculating points score
  const questions = await quiz.getQuestions();
  let n_correct = 0;
  const ans = [];
  for (let i = 0; i < questions.length; ++i) {
    const answers = await questions[i].getAnswers({
      order: [["answer_id", "ASC"]],
    });
    if (answers == null) {
      res.sendStatus(500);
      return;
    }
    if (answers[selected_answers[i]].is_correct) n_correct++;
    ans.push(answers);
  }

  const multiplier = duration == null ? 1 : quiz.time_limit / duration;
  const points = n_correct * multiplier;
  res.json({
    platform: platform,
    quiz: quiz,
    questions: questions,
    answers: ans,
    selected_answers: selected_answers,
    points: points,
  });
});

router.put("/:quiz_id/question/", async (req, res) => {
  const quiz_id = req.params.quiz_id;
  const questions_fields = req.body.questions_fields;
  const answers_fields = req.body.answers_fields;
  if (answers_fields.length !== questions_fields.length) {
    res.sendStatus(400);
    return;
  }
  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } }).catch(
    (err) => {
      console.log("GET QUIZ: ", err);
    }
  );
  if (quiz == null) {
    res.sendStatus(404);
    return;
  }
  const questions = await quiz.getQuestions();
  if (questions.length > questions_fields.length) {
    const delete_ids = [];
    for (let i = questions_fields.length; i < questions.length; ++i) {
      delete_ids.push(questions[i].question_id);
    }
    await Questions.destroy({ where: { question_id: delete_ids } }).catch(
      (err) => {
        console.log("DELETE Extra Questions: ", err);
      }
    );
  }
  for (let i = 0; i < questions_fields.length; ++i) {
    // ensure quiz_id is not changed
    questions_fields[i].quiz_id = quiz_id;
    const question_fields = {
      quiz_id: quiz_id,
      question_text: questions_fields[i].question_text,
    };
    if (i < questions.length) {
      // ensure question_id is not changed
      await Questions.update(question_fields, {
        where: {
          question_id: questions[i].question_id,
        },
      }).catch((err) => {
        console.log("PUT Upate Question: ", err);
      });

      const answers = await questions[i].getAnswers();
      console.log(answers_fields);
      if (answers.length > answers_fields[i].length) {
        const delete_ids = [];
        for (let j = answers_fields[i].length; j < answers.length; ++j) {
          delete_ids.push(answers[j].answer_id);
        }
        console.log(delete_ids);
        await Answers.destroy({ where: { answer_id: delete_ids } }).catch(
          (err) => {
            console.log("DELETE Extra Answers: ", err);
          }
        );
      }
      for (let j = 0; j < answers_fields[i].length; ++j) {
        const answer_fields = {
          question_id: questions[i].question_id,
          answer_text: answers_fields[i][j].answer_text,
          is_correct: answers_fields[i][j].is_correct,
        };
        if (j < answers.length) {
          await Answers.update(answer_fields, {
            where: {
              answer_id: answers[j].answer_id,
            },
          }).catch((err) => {
            console.log("PUT Update Answer: ", err);
          });
        } else {
          await Answers.create(answer_fields).catch((err) => {
            console.log("PUT Create Ans: ", err);
          });
        }
      }
    } else {
      const new_question = await Questions.create(question_fields).catch(
        (err) => {
          console.log("POST Create Question: ", err);
        }
      );
      for (let j = 0; j < answers_fields[i].length; ++j) {
        const answer_fields = {
          question_id: new_question.question_id,
          answer_text: answers_fields[i][j].answer_text,
          is_correct: answers_fields[i][j].is_correct,
        };
        await Answers.create(answer_fields).catch((err) => {
          console.log("PUT Answers: ", err);
        });
      }
    }
  }
  res.sendStatus(204);
});

router.put("/:quiz_id/image-upload", async (req, res) => {
  //res.send('Quiz Image');
  const quiz_fields = req.body.quiz_fields;
  console.log(quiz_fields);

  await Quizzes.update(quiz_fields, {
    where: {
      quiz_id: req.params.quiz_id,
    },
  }).catch((err) => {
    console.log("PUT Quiz error: ", err);
  });
  res.sendStatus(200);

  return;
});

router.get("/:quiz_id/get-image", async (req, res) => {
  // res.send('Get Quiz Image')
  const quiz = await Quizzes.findOne({
    where: { quiz_id: req.params.quiz_id },
  }).catch((err) => {
    console.log("Get Quiz error: ", err);
  });
  if (quiz == null) {
    res.sendStatus(404);
    return;
  }

  res.json({ icon_photo: quiz.icon_photo });
});

module.exports = router;
