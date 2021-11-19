const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Users } = require('../models');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: config.googleCallbackUrl,
  passReqToCallback: true,
}, async (req, accessToken, refTok, profile, done) => {
  const defaultUser = {
    username: profile.id,
    email: profile.emails[0].value,
    picture: profile.photos[0].value,
  }

  const user = await Users.findOrCreate({
    where: { email: profile.emails[0].value },
    defaults: defaultUser
  }).catch((err) => {
    console.log('error', err);
    done(err, null);
  })
  if (user[0].username === profile.id) {
    user[0].username = user[0].user_id;
    await user[0].save();
  }
  if (user && user[0])
    return done(null, user && user[0])
}));

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (user_id, done) => {
  //done(null, user_id);
  const user = await Users.findOne({ where: { user_id: user_id } })
    .catch((err) => {
      console.log('err', err);
      done(err, null);
    }).then((user) => done(null, user));
});