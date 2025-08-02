const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('./db/connect');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const { ObjectId } = require('mongodb');
const MongoDBStore = require('connect-mongodb-session')(session);
const dotenv = require('dotenv');
dotenv.config();



const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Create a new session store in MongoDB
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions',
});

app
  .use(cors({
    origin: ['https://cse341-project2-7osd.onrender.com', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // if you need to support cookies/sessions across origins
  }))
  .use(bodyParser.json())
  .use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
    secure: process.env.NODE_ENV === 'production', // Enable in production
    httpOnly: true, // Helps against XSS
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });





// passport.use(new GitHubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: process.env.CALLBACK_URL
// },

// function(accessToken, refreshToken, profile, done) {
//   // User.findOrCreate({ githubId: profile.id}, function (err, user) {
//     return done(null, profile);
//   // });
// }
// ));


// --- PASSPORT STRATEGY WITH MONGODB DRIVER ---
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
async function(accessToken, refreshToken, profile, done) {
    try {
        const database = mongodb.getDb().db();
        const usersCollection = database.collection('appusers');

        const result = await usersCollection.findOneAndUpdate(
            { githubId: profile.id },
            {
                $set: {
                    username: profile.username,
                    displayName: profile.displayName || profile.username,
                    profileUrl: profile.profileUrl,
                }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        return done(null, result.value);
    } catch (err) {
        return done(err, false);
    }
}
));

// passport.serializeUser((user, done) => {
//   done(null, { id: user.id, displayName: user.displayName, username: user.username });
// });

// This is the correct serializer for a database-driven approach.
passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});



passport.deserializeUser(async (id, done) => {
    try {
        const database = mongodb.getDb().db();
        const usersCollection = database.collection('appusers');
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


app.use('/', require('./routes'));

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