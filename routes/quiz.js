const express = require("express");
const router = express.Router();
const { Quizzes, Answers, Questions } = require("../models");


router.get('/', async (req, res) => {
  const quizzes = await Quizzes.findAll();
  res.status(200).send(quizzes);
});

router.post("/", async (req, res) => {
  //res.send("Hello quizzes");
  const quiz_fields = req.body.quiz_fields;
  const quiz = await Quizzes.create(quiz_fields)
    .catch(err => {
      console.log('POST Quiz: ', err);
    });
  res.status(201).send(quiz);
});

router.delete('/:quiz_id', async (req, res) => {
  //res.send('Deletes Quiz');
  const quiz_id = req.params.quiz_id;
  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } })
    .catch(err => {
      console.log('DELETE Quiz: ', err);
    })
  if (quiz != null) {
    await quiz.destroy()
      .catch(err => {
        console.log('DELETE QUIZ: ', err);
      })
  }
  res.sendStatus(204);
});

router.get('/:quiz_id', async (req, res) => {
  //res.send(`Gets Quiz by Id: ${req.params.quiz_id}`);
  const quiz_id = req.params.quiz_id;

  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } })
    .catch(err => {
      console.log('GET QUIZ: ', err);
    })
  if (quiz == null)
    res.sendStatus(404);
  else {
    const questions = await quiz.getQuestions();
    console.log(questions)
    let answers = [];
    for(let i= 0; i<questions.length; ++i){
      let answer_list = await questions[i].getAnswers();
      answers.push(answer_list);
    }
    console.log(answers)
    res.json({ quiz: quiz, questions: questions, answers: answers });
  }
});

router.post('/:quiz_id/results', (req, res) => {
  res.send(`Posts results of quiz by Id: ${req.params.quiz_id}`);
});

router.put('/:quiz_id/creator', async (req, res) => {
  //res.send(`Puts updated quiz by Id: ${req.params.quiz_id}`);
  //console.log(req.params)
  const quiz_id = req.params.quiz_id;
  const updates = req.body.quiz_fields;
  //const {updates, questions} = req.body;
  //console.log(req.body);
  await Quizzes.update(updates, {
    where: {
      quiz_id: quiz_id
    }
  }).catch(err => {
    console.log('PUT quiz creator: ', err);
    res.sendStatus(404);
  })

});

router.put('/:quiz_id/question/', async (req, res) => {
  //console.log(req);
  const quiz_id = req.params.quiz_id;
  const questions_fields = req.body.questions_fields;
  const answers_fields = req.body.answers_fields;
  if (answers_fields.length !== questions_fields.length) {
    res.sendStatus(400);
    return;
  }
  const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } })
    .catch(err => {
      console.log('GET QUIZ: ', err);
    });
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
    await Questions.destroy({ where: { question_id: delete_ids } })
      .catch(err => {
        console.log('DELETE Extra Questions: ', err);
      })
  }
  for (let i = 0; i < questions_fields.length; ++i) {
    // ensure quiz_id is not changed
    questions_fields[i].quiz_id = quiz_id;
    const question_fields = {
      quiz_id: quiz_id,
      question_text: questions_fields[i].question_text
    }
    if (i < questions.length) {
      // ensure question_id is not changed
      await Questions.update(question_fields, {
        where: {
          question_id: questions[i].question_id
        }
      }).catch(err => {
        console.log('PUT Upate Question: ', err);
      })

      const answers = await questions[i].getAnswers();
      if (answers.length > answers_fields[i].length) {
        const delete_ids = [];
        for (let i = answers_fields.length; i < answers.length; ++i) {
          delete_ids.push(answers[i].answer_id);
        }
        await Answers.destroy({ where: { answer_id: delete_ids } })
          .catch(err => {
            console.log('DELETE Extra Answers: ', err);
          })
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
            }}).catch(err => {
            console.log('PUT Update Answer: ', err);
          })
        }
        else {
          await Answers.create(answer_fields)
            .catch(err => {
              console.log('PUT Create Ans: ', err);
            });
        }
      }
    }
    else {
      const new_question = await Questions.create(question_fields)
        .catch(err => {
          console.log('POST Create Question: ', err);
        });
      for (let j = 0; j < answers_fields[i].length; ++j) {
        const answer_fields = {
          question_id: new_question.question_id,
          answer_text: answers_fields[i][j].answer_text,
          is_correct: answers_fields[i][j].is_correct,
        };
        await Answers.create(answer_fields)
          .catch(err => {
            console.log('PUT Answers: ', err);
          });
      }
    }
  }
  res.sendStatus(204);
});

module.exports = router;
