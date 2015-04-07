// var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var User = require('../models/user');
var Token = require('../models/token');

var uid = require('uid');


module.exports = function(passport) {

    // required for persistent login sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =-=-=-=-=-=-=-=-=-=-=-=
    // local signup
    // =-=-=-=-=-=-=-=-=-=-=-=
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, username, password, done) {

        process.nextTick(function() {
            User.findOne({ 'username' : username }, function(err, user) {
                if(err) {
                    return done(err);
                }

                if(user) {
                    console.log('username already taken');
                    return done(null, false, req.flash('message', 'That username is already taken'));
                }

                // if logged in, link a new local account
                if(req.user) {
                    var user = req.user;
                    user.password = user.generateHash(password);
                    user.username = username;
                    user.isAdmin = false;
                    user.save(function(err) {
                        if(err) {
                            throw err;
                        }
                        return done(null, user);
                    });
                } else {
                    var newUser = new User();
                    newUser.username = username;
                    newUser.password = newUser.generateHash(password);
                    newUser.isAdmin = false;
                    newUser.save(function(err) {
                        if(err) {
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            }); // end user.findone
        });
    })); // end passport.use('local-signup')


    // =-=-=-=-=-=-=-=-=-=-=-=
    // Local login
    // =-=-=-=-=-=-=-=-=-=-=-=
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, username, password, done) {
        console.log(username, password, done);

        process.nextTick(function() {
            User.findOne({ 'username': username }, function(err, user) {
                if(err) {
                    return done(err);
                }

                if(!user) {
                    return done(null, false, req.flash('message', 'No user found'));
                }

                if(!user.validPassword(password)) {
                    return done(null, false, req.flash('message', 'Wrong password'));
                }

                return done(null, user);
            });
        });
    }));

    passport.use('token', new BasicStrategy(
        function(username, password, done) {
            process.nextTick(function() {
                User.findOne({ 'username': username }, function(err, user) {
                    if (err) {
                        return done(err);
                    }

                    if(!user) {
                        return done(null, false);
                    }

                    if(!user.validPassword(password)) {
                        return done(null, false);
                    }

                    var token = new Token({
                        value: uid(256),
                        clientId: user._id
                    });
                    return done(null, token);
                });
            });
        }
    ));

    passport.use(new BearerStrategy(function(accessToken, callback) {
        Token.findOne({ value: accessToken }, function(err, token) {
            if(err) {
                return callback(err);
            }

            if(!token) {
                return callback(null, false);
            }

            User.findOne({ _id: token.userId }, function(err, user) {
                if(err) {
                    return callback(err);
                }

                if(!user) {
                    return callback(null, false);
                }

                callback(null, user, { scope: '*' });
            });
        });
    }));

}; // end module.export
