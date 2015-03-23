var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');

passport.use(new BasicStrategy(
    function(username, password, callback) {
        console.log('checking users');

        User.findOne({ username: username }, function(err, user) {
            console.log('found user');
            if(err) {
                console.log('error');
                return callback(err);
            }

            if(!user) {
                console.log('no user found');
                return callback(null, false);
            }

            if(!user.validPassword(password)) {
                return callback(null, false);
            }
            return callback(null, user);

            // user.validPassword(password, function(err, isMatch) {
            //     console.log('verifyPassword');
            //     if(err) {
            //         return callback(err);
            //     }

            //     if(!isMatch) {
            //         return callback(null, false);
            //     }

            //     return callback(null, user);
            // });
        });
    }
));

exports.isAuthenticated = passport.authenticate('basic', { session: false });