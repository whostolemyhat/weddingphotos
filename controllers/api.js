var express = require('express');
var router = express.Router();
var Photo = require('../models/photo');
var formidable = require('formidable');
var fs = require('fs-extra');
var lwip = require('lwip');
var path = require('path');
var io = require('../controllers/io');
var passport = require('passport');
var authController = require('../controllers/auth')(passport);

var bodyParser = require('body-parser');
var tokenAuth = require('./tokenauth');

// NOTE: Bodyparser does not handle multipart forms
// using formidable instead

function createThumbnail(filepath, filename, photo) {
    'use strict';

    console.log('creating thumbnail for ' + filename);
    
    lwip.open(filepath + filename, function(err, image) {
        if(err) {
            console.error(err);
        } else {
            image.batch()
                .contain(400, 450, [255, 254, 224, 1])
                // .contain(400, 450, 'blue')
                // .scale(0.5)
                // .crop(450, 300)
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

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/', req.flash('message', 'Please log in'));
}


/* under /api */
router
    .get('/',  function(req, res) {
        'use strict';
        res.render('upload');
    })
    .get('/photos', function(req, res) {
        'use strict';
        return Photo.find().sort({ date: -1 }).exec(function(err, photos) {
            if(err) {
                console.error(err);
            } else {
                return res.send(photos);
            }
        });
    })

    .post('/photos', isLoggedIn, function(req, res) {
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
            for(var i = 0; i < files.length; i++) {
                var tempPath = this.openedFiles[i].path;
                var date = new Date();
                var filename = date.getTime() + '-' + this.openedFiles[i].name;
                var newLocation = path.join(__dirname, '../public/uploads/');

                var photo = new Photo({
                    path: '/uploads/' + filename,
                    caption: fields.caption,
                    takenBy: {
                        id: req.user._id,
                        username: req.user.username
                    },
                    thumbnail: '/uploads/thumbs/' + filename,
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

                photo.save(function(err) {
                    if(err) {
                        console.log(err);
                        return console.error(err);
                    }
                    res.send(photo);
                });

                return res.send(photo);
            }
        });

        form.parse(req);
    })

    .get('/photos/refresh/:id', function(req, res) {
    // redo thumbnail
        // res.send(userId);
        if(!req.user) {
            res.status(403);
            return res.send('Error: must be logged in');
        }

        return Photo.findById(req.params.id, function(err, photo) {
            if(err) {
                console.error(err);
                return res.send(err);
            }
            if(!photo) {
                console.error(err);
                return res.send(err);
            }
            // console.log(userId, photo.takenBy.id);
            var userId = String(req.user._id);

            if(photo.takenBy.id === userId || req.user.isAdmin) {
                // res.send('id:' + String(req.user._id));
                // var img = photo.path;
                var thumbnail = photo.thumbnail;
                var prefix = path.join(__dirname, '../public/');

                fs.remove(path.join(prefix, thumbnail), function(err) {
                    if(err) {
                        console.error(err);
                    }
                    var newLocation = path.join(__dirname, '../public/uploads/');
                    console.log('deleted thumbnail for ' + photo.path);
                    console.log(newLocation, photo.path.replace('/uploads/', ''), photo);
                    createThumbnail(newLocation, photo.path.replace('/uploads/', ''), photo);
                    res.send(photo.path);
                });
                //         return res.send('');
                //     }
                // });
            } else {
                res.status(403);
                return res.send('Error: photo does not belong to user');
            }
        });
        // delete existing thumb
        // get exisitng photo
        // create thumbnail
        // createThumbnail(newLocation, filename, photo);

        // return '/uploads/thumbs/' + filename;
    })
    
    // copy - use for rpi
    .post('/autophoto', [bodyParser(), tokenAuth], function(req, res) {
        if(req.user) {
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

                var tempPath = this.openedFiles[0].path;
                var date = new Date();
                var filename = date.getTime() + '-' + this.openedFiles[0].name;
                var newLocation = path.join(__dirname, '../public/uploads/');

                var photo = new Photo({
                    path: '/uploads/' + filename,
                    caption: fields.caption,
                    takenBy: {
                        id: req.user._id,
                        username: req.user.username
                    },
                    thumbnail: '/uploads/thumbs/' + filename,
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
        } else {
            res.end('No!');
        }
    })

    .get('/photos/:id', function(req, res) {
        // get one photo
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
    .delete('/photos/:id', isLoggedIn, function(req, res) {
        'use strict';
        // photo.takenBy.id is a string
        var userId = String(req.user._id);
        return Photo.findById(req.params.id, function(err, photo) {
            console.log(userId, photo.takenBy.id);

            if(photo.takenBy.id === userId || req.user.isAdmin) {
                var img = photo.path;
                var thumbnail = photo.thumbnail;
                var prefix = path.join(__dirname, '../public/');

                return photo.remove(function(err) {
                    if(err) {
                        console.error(err);
                    } else {
                        // find file
                        fs.remove(path.join(prefix, img), function(err) {
                            if(err) {
                                console.error(err);
                            }
                        });
                        fs.remove(path.join(prefix, thumbnail), function(err) {
                            if(err) {
                                console.error(err);
                            }
                        });
                        return res.send('');
                    }
                });
            } else {
                res.status(403);
                return res.send('Error: photo does not belong to user');
            }
        });
    });


module.exports = router;