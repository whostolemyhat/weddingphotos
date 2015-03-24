var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');

passport.use(new BasicStrategy(
    function(username, password, callback) {
        User.findOne({ username: username }, function(err, user) {
            if(err) {
                console.log('error');
                return callback(err);
            }

            if(!user) {
                return callback(null, false);
            }

            if(!user.validPassword(password)) {
                return callback(null, false);
            }
            return callback(null, user);
        });
    }
));

exports.isAuthenticated = passport.authenticate('basic', { session: false });