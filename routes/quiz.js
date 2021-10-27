const express = require("express");
const router = express.Router();
const { Quizzes, Answers, Questions } = require ("../models");


router.get('/', async (req, res) => {
  const quizzes = await Quizzes.findAll();
  res.status(200).send(quizzes);
});

router.post("/", async (req, res) =>{
    //res.send("Hello quizzes");
    const quiz_fields = req.body.quiz_fields;
    const quiz = await Quizzes.create(quiz_fields)
        .catch( err => {
            console.log('POST Quiz: ', err);
        });
    res.status(201).send(quiz);
});

router.delete('/:quiz_id', async (req, res) => {
    //res.send('Deletes Quiz');
    const quiz_id = req.params.quiz_id;
    const quiz = await Quizzes.findOne({ where: { quiz_id: quiz_id } })
        .catch( err => {
            console.log('DELETE Quiz: ', err);
        })
    if(quiz != null){
        await quiz.destroy()
            .catch( err => {
                console.log('DELETE QUIZ: ', err);
            })
    }
    res.sendStatus(204);
});

router.get('/:quiz_id', async (req, res) => {
   //res.send(`Gets Quiz by Id: ${req.params.quiz_id}`);
    const quiz_id = req.params.quiz_id;
    
    const questions = await Questions.findAll({ where: { quiz_id: quiz_id } });
    const quiz = await Quizzes.findOne({ where : { quiz_id: quiz_id } })
      .catch( err => {
        console.log('GET QUIZ: ', err);
      })
    if( quiz == null )
      res.sendStatus(404);
    else
      res.json({quiz: quiz, questions: questions});
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
  console.log(req.body);
  await Quizzes.update(updates, { 
    where: { 
      quiz_id: quiz_id 
    } 
  }).catch( err => {
    console.log('PUT quiz creator: ', err);
    res.sendStatus(404);
  })

});

router.put('/:quiz_id/question/', async (req, res) => {
    //res.send(`Puts updated quiz by Id: ${req.params.quiz_id}`);
    console.log(req);
    const question_id = req.body.question_id; 
    const question_fields = req.body.question_fields;
    await Questions.create(question_fields, { 
      where: { 
        question_id: question_id,
      } 
    }).catch( err => {
      console.log('PUT question: ', err);
      res.sendStatus(404);
    })
    res.sendStatus(204);
});

module.exports = router;
