const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('./db/connect');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;

const dotenv = require('dotenv');
dotenv.config();

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app
  .use(cors({
    origin: ['https://cse341-project2-7osd.onrender.com', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  .use(bodyParser.json())
  .use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  })
  .use('/', require('./routes'));





passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},

function(accessToken, refreshToken, profile, done) {
  // User.findOrCreate({ githubId: profile.id}, function (err, user) {
    return done(null, profile);
  // });
}
));

passport.serializeUser((user, done) => {
  done(null, { id: user.id, displayName: user.displayName, username: user.username });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/github/callback', 
  passport.authenticate('github', {
    failureRedirect: '/api-docs'}),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/');   
});


app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // `req.user` is now correctly populated by Passport's session middleware.
    // We can confidently access its properties.
    const userDisplayName = req.user.displayName || req.user.username || 'Anonymous User';
    res.send(`Logged in as ${userDisplayName}`);
  } else {
    res.send('Logged out');
  }
});


process.on('uncaughtException', (err, origin) => {
  console.log(process.stderr.fd, `Caught exception: ${err}\n` + `Exception origin: ${origin}`);
});


const port = process.env.PORT || 8080;
mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
      app.listen(port);
      console.log(`Connected to DB and listening on port ${port}`);
    }
});