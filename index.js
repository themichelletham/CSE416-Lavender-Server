const express = require('express');
const cors = require('cors')
const helmet = require('helmet');
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(helmet())
app.use(cors());

const db = require("./models");

//Routers
const platformRouter = require("./routes/platform");
app.use("/platform", platformRouter);

const userRouter = require("./routes/users");
app.use("/users", userRouter);

const quizRouter = require("./routes/quiz");
app.use("/quiz", quizRouter);

const authRouter = require("./routes/auth");
app.use("/authboard", authRouter);

const searchRouter = require("./routes/search");
app.use("/search", searchRouter);


db.sequelize.sync().then(() => {

    app.listen(process.env.PORT || 3001, () => {
        console.log("Server running on port 3001");
    });
})
.catch((err) => {
    console.log(err);
});