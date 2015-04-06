// var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

// exports.isAuthenticated = passport.authenticate('basic', { session: false });

module.exports = function(passport) {
    // -=-=-=-=-=-=-=-=-=-=-=-
    // basic
    // -=-=-=-=-=-=-=-=-=-=-=-
    // passport.use(new BasicStrategy(
    //     function(username, password, callback) {
    //         User.findOne({ username: username }, function(err, user) {
    //             if(err) {
    //                 console.log('error');
    //                 return callback(err);
    //             }

    //             if(!user) {
    //                 return callback(null, false);
    //             }

    //             if(!user.validPassword(password)) {
    //                 return callback(null, false);
    //             }
    //             return callback(null, user);
    //         });
    //     }
    // ));

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
            User.findOne({ 'local.username' : username }, function(err, user) {
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
                    user.local.password = user.generateHash(password);
                    user.local.username = username;
                    user.isAdmin = false;
                    user.save(function(err) {
                        if(err) {
                            throw err;
                        }
                        return done(null, user);
                    });
                } else {
                    var newUser = new User();
                    newUser.local.username = username;
                    newUser.local.password = newUser.generateHash(password);
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
            User.findOne({ 'local.username': username }, function(err, user) {
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

}; // end module.export
