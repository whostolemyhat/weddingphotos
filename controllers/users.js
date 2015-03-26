var express = require('express');
var router = express.Router();
var User = require('../models/user');


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/', req.flash('loginMessage', 'Please log in'));
}

/* under /users */
router
    .get('/', isLoggedIn, function(req, res, next) {
        User.find(function(err, users) {
            if(err) {
                res.send(err);
            }
            res.json(users);
        });
    })
    .post('/', isLoggedIn, function(req, res) {
        console.log(req.body);
        var user = new User();
        user.username = req.body.username;
        user.password = user.generateHash(req.body.password);

        user.save(function(err) {
            if(err) {
                res.send(err);
            }
            res.json(user);
        });
    });

module.exports = router;
