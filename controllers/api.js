var express = require('express');
var router = express.Router();
var Photo = require('../models/photo');
var formidable = require('formidable');
var fs = require('fs-extra');
var lwip = require('lwip');
var path = require('path');
var io = require('../controllers/io');
var authController = require('../controllers/auth');

// NOTE: Bodyparser does not handle multipart forms
// using formidable instead

function createThumbnail(filepath, filename, photo) {
    'use strict';
    lwip.open(filepath + filename, function(err, image) {
        if(err) {
            console.error(err);
        } else {
            image.batch()
                .scale(0.5)
                .crop(450, 300)
                .writeFile(path.join(__dirname, '../public/uploads/thumbs/') + filename, function(err) {
                    if(err) {
                        console.error(err);
                    } else {
                        console.log('successfully created thumbnail');
                        // emit event
                        io.emit('photo', photo);
                    }
                });
        }
    });
}


/* under /api */
router
    .get('/',  function(req, res) {
        'use strict';
        res.render('upload');
    })
    .get('/photos', authController.isAuthenticated, function(req, res) {
        'use strict';
        return Photo.find().sort({ date: -1 }).exec(function(err, photos) {
            if(err) {
                console.error(err);
            } else {
                return res.send(photos);
            }
        });
    })

    .post('/photos', function(req, res) {
        'use strict';

        console.log('posted form');
        var photos = [];

        var form = new formidable.IncomingForm();
        var files = [];
        var fields = {};

        form.on('field', function(field, value) {
            fields[field] =  value;
        });

        form.on('file', function(field, file) {
            console.log(file.name);
            files.push([field, file]);
        });

        form.on('end', function() {
            // for(var i = 0; i < this.openedFiles.length; i++) {
            var tempPath = this.openedFiles[0].path;
            var date = new Date();
            var filename = date.getTime() + '-' + this.openedFiles[0].name;
            var newLocation = path.join(__dirname, '../public/uploads/');

            var photo = new Photo({
                path: '/uploads/' + filename,
                caption: fields.caption,
                takenBy: fields.takenBy,
                thumbnail: '/uploads/thumbs/' + filename,
                // thumbnail: 'img/thumbs/placeholder.png',
                date: date
            });

            fs.copy(tempPath, newLocation + filename, function(err) {
                if(err) {
                    console.log(err);
                    return console.error(err);
                }
                console.log('success');
                // create thumbnail
                createThumbnail(newLocation, filename, photo);
            });


            return photo.save(function(err) {
                if(err) {
                    console.log(err);
                    return console.error(err);
                }
                return res.send(photo);
            });
        });

        form.parse(req);
    })
    .get('/photos/:id', function(req, res) {
        'use strict';
        return Photo.findById(req.params.id, function(err, photo) {
            if(err) {
                console.log(err);
                console.error(err);
            } else {
                return res.send(photo);
            }
        });
    })
    .put('/photos/:id', function(req, res) {
        'use strict';

        // TODO: what needs to be updatable?
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            return Photo.findById(req.params.id, function(err, photo) {
                console.log(fields);

                photo.caption = fields.caption;
                photo.takenBy = fields.takenBy;
                photo.date = fields.date;

                return photo.save(function(err) {
                    if(err) {
                        console.log(err);
                        console.error(err);
                    } else {
                        return res.send(photo);
                    }
                });
            });
        });
    })
    .delete('/photos/:id', function(req, res) {
        'use strict';
        return Photo.findById(req.params.id, function(err, photo) {
            return photo.remove(function(err) {
                if(err) {
                    console.error(err);
                } else {
                    return res.send('');
                }
            });
        });
    });


module.exports = router;