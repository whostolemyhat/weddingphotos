var express = require('express');
var router = express.Router();
var Photo = require('../schemas/photo');
var formidable = require('formidable');
var fs = require('fs-extra');
var lwip = require('lwip');

// NOTE: Bodyparser does not handle multipart forms
// using formidable instead

/* under /api */
router
    .get('/', function(req, res) {
        'use strict';
        res.render('upload');
    })
    .get('/photos', function(req, res) {
        'use strict';
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
        var fields = {};

        form.on('field', function(field, value) {
            fields[field] = value;
        });

        form.on('file', function(field, file) {
            files.push([field, file]);
        });

        form.on('end', function() {
            // save file
            var tempPath = this.openedFiles[0].path;
            var date = new Date();
            var filename = date.getTime() + '-' + this.openedFiles[0].name;
            var newLocation = 'public/uploads/';

            fs.copy(tempPath, newLocation + filename, function(err) {
                if(err) {
                    console.error(err);
                } else {
                    console.log('success');

                    // create thumbnail
                    lwip.open(newLocation + filename, function(err, image) {
                        if(err) {
                            console.error(err);
                        } else {
                            image.batch()
                                .scale(0.5)
                                .crop(200, 200)
                                .writeFile(newLocation + '/thumbs/' + filename, function(err) {
                                    if(err) {
                                        console.error(err);
                                    } else {
                                        console.log('successfully created thumbnail');
                                    }
                                });
                        }
                    });
                }
            });

            var photo = new Photo({
                path: newLocation + filename,
                caption: fields.caption,
                takenBy: fields.takenBy,
                thumbnail: newLocation + '/thumbs/' + filename,
                date: date
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
    })
    .get('/photos/:id', function(req, res) {
        'use strict';
        return Photo.findById(req.params.id, function(err, photo) {
            if(err) {
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

                return photo.save(function(err) {
                    if(err) {
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
                    return response.send('');
                }
            });
        });
    });

module.exports = router;