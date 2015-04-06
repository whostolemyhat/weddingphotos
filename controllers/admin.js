var express = require('express');
var router = express.Router();
var User = require('../models/user');

function isAdminLoggedIn(req, res, next) {
    if(req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }

    res.redirect('/', req.flash('message', 'Please log in'));
}

router
    .get('/', isAdminLoggedIn, function(req, res) {
        User.find(function(err, users) {
            if(err) {
                res.send(err);
            }
            res.render('admin', { users: users });
        });
    })
    .get('/user/:id', isAdminLoggedIn, function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if(err) {
                res.send(err);
            }
            res.render('admin-user', { user: user });
        });
    });

module.exports = router;