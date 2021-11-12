const express = require('express');
const passport = require('passport');
const cors = require('cors');
const app = express();
const cookieSession = require('cookie-session');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
require('./auth/googleSSO');

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(cookieSession({
  maxAge: 24*60*60*1000,
  keys: ['randomSalt'], //replace with bcrypt or something
  secure: true,
  secureProxy: true,
}))

const db = require("./models");

//Routers
const authRouter = require('./routes/auth');
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRouter);

const platformRouter = require("./routes/platform");
app.use("/platform", platformRouter);

const userRouter = require("./routes/users");
app.use("/users", userRouter);

const quizRouter = require("./routes/quiz");
app.use("/quiz", quizRouter);

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
