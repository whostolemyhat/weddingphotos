var express = require('express');
var router = express.Router();
var Photo = require('../schemas/photo');
var formidable = require('formidable');
var fs = require('fs-extra');

/* under /api */
router
    .get('/', function(req, res) {
        res.render('api');
    })
    .get('/photos', function(req, res) {
        return Photo.find(function(err, photos) {
            if(err) {
                console.error(err);
            } else {
                return res.send(photos);
            }
        });
    })
    .post('/photos', function(req, res) {
        'use strict';

        var form = new formidable.IncomingForm();
        var files = [];
        var fields = [];

        form.on('field', function(field, value) {
            fields.push(field, value);
        });

        form.on('file', function(field, file) {
            console.log(file.name);
            files.push([field, file]);
        });

        form.on('end', function() {
            // save file
            var tempPath = this.openedFiles[0].path;
            var filename = this.openedFiles[0].name;
            var newLocation = 'uploads/';

            console.log(this.openedFiles);
            console.log(filename);
            fs.copy(tempPath, newLocation + filename, function(err) {
                if(err) {
                    console.error(err);
                } else {
                    console.log('success');
                }
            });

            var photo = new Photo({
                path: newLocation + filename,
                takenBy: req.body.takenBy,
                thumbnail: req.body.thumb,
                date: new Date(),
                caption: req.body.caption
            });

            return photo.save(function(err) {
                if(err) {
                    console.error(err);
                } else {
                    return res.send(photo);
                }
            });
        });

        form.parse(req);
    });

module.exports = router;