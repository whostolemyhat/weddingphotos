var User = require('../models/user');
var moment = require('moment');
var jwt = require('jwt-simple');
var secret = require('../config/session').secret;

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

    // app.get('/token', passport.authenticate('token', { session: false }), function(req, res) {
    //     // res.json();
    //     console.log(res);
    //     res.end('hello');
    // });

    app.post('/token', function(req, res) {
        var username = req.body.username;
        var password = req.body.password;

        console.log(req.body);
        User.findOne({ 'username': username }, function(err, user) {
            if (err) {
                console.error(err);
                return res.send(401);
            }

            if(!user) {
                console.error('No user found');
                return res.send(401);
            }

            if(!user.validPassword(password)) {
                console.error('Incorrect password');
                return res.send(401);
            }

            var expires = moment().add(7, 'day').valueOf();
            var token = jwt.encode({
                iss: user._id,
                exp: expires
            }, secret);

            // var token = new Token({
            //     value: uid(256),
            //     clientId: user._id
            // });
            res.json({
                token: token,
                expires: expires,
                user: user.toJSON()
            });
        });
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
