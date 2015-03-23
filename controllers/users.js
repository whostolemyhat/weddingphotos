var express = require('express');
var router = express.Router();
var User = require('../models/user');


/* GET users listing. */
router
    .get('/', function(req, res, next) {
        User.find(function(err, users) {
            if(err) {
                res.send(err);
            }
            res.json(users);
        });
    })
    .post('/', function(req, res) {
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
