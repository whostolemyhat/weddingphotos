var User = require('../models/user');
var jwt = require('jwt-simple');
var secret = require('../config/session').secret;

module.exports = function(req, res, next) {
    var token = (req.body && req.body.access_token) ||
        (req.query && req.query.access_token) ||
        req.headers['x-access-token'];

    console.log(token);
    if(token) {
        try {
            var decoded = jwt.decode(token, secret);
            if(decoded.exp <= Date.now()) {
                res.end('Access token has expired', 400);
            }

            User.findOne({ _id: decoded.iss }, function(err, user) {
                if(err) {
                    console.error(err);
                    return res.end(500);
                }

                if(!user) {
                    console.error(err);
                    return res.end('No user found', 400);
                }
                req.user = user;
                return next();
            });
        } catch(err) {
            console.log(err);
            return next();
        }
    } else {
        next();
    }
};