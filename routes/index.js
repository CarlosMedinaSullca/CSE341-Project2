const express = require('express');
const router = express.Router();
const users = require('./users');
const foods = require('./foods');
const passport = require('passport');

router.use('/users', users);
router.use('/foods', foods);

// router.get('/', (req,res) => {
//     res.send('Welcome to the API!');
// })

router.get('/login', passport.authenticate('github'), (req, res) => {} );

router.get('/logout', function(req, res, next) {
    req.logOut(function(err) {
        if(err) {return next(err);}
        res.redirect('/');
    });
});

module.exports = router;