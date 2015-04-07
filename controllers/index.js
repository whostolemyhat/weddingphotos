var User = require('../models/user');

/* GET home page. */
module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('home', {
            user: req.user,
            message: req.flash('message')
        });
    });
    app.post('/', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    app.get('/token', passport.authenticate('token', { session: false }), function(req, res) {
        res.json(req.user);
    });

    // app.get('/login', function(req, res) {
    //     res.render('login', { message: req.flash('loginMessage') });
    // });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    app.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('message') });
    });
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));
};
