const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('./db/connect');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const { ObjectId } = require('mongodb'); 
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let corsOptions = {
    origin: ['https://cse341-project2-7osd.onrender.com', 'http://localhost:8080']
}

app
  .use(cors(corsOptions))
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
  .use(cors({ methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']}))
  .use(cors({ origin: '*'}))
  .use('/', require('./routes'));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},

async function(accessToken, refreshToken, profile, done) {
    try {
        const database = mongodb.getDb();
        const usersCollection = database.collection('appusers');

        // Use findOneAndUpdate with upsert: true to find or create the user in one operation.
        const result = await usersCollection.findOneAndUpdate(
            { githubId: profile.id }, // Filter by githubId
            {
                $set: {
                    username: profile.username,
                    displayName: profile.displayName || profile.username,
                    profileUrl: profile.profileUrl,
                    // Store other profile data as needed
                }
            },
            {
                upsert: true, // Create a new document if it doesn't exist
                returnDocument: 'after' // Return the updated/newly created document
            }
        );

        // The user document is in result.value
        return done(null, result.value);

    } catch (err) {
        return done(err, false);
    }
}
// function(accessToken, refreshToken, profile, done) {
//   // User.findOrCreate({ githubId: profile.id}, function (err, user) {
//     return done(null, profile);
//   // });
// }
));

passport.serializeUser((user, done) => {
  done(null, { id: user.id, displayName: user.displayName, username: user.username });
});

passport.deserializeUser(async (id, done) => {
    try {
        const database = mongodb.getDb();
        const usersCollection = database.collection('appusers');
        // Find the user by their _id using the ObjectId class
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        done(null, user);
    } catch (err) {
        done(err, false);
    }
});


// passport.deserializeUser((user, done) => {
//   done(null, user);
// });



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