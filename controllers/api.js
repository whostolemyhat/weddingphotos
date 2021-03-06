'use strict';

const express = require('express');
const router = express.Router();
const Photo = require('../models/photo');
const formidable = require('formidable');
const fs = require('fs-extra');
const lwip = require('lwip');
const path = require('path');
const io = require('../controllers/io');
const passport = require('passport');
const authController = require('../controllers/auth')(passport);

const bodyParser = require('body-parser');
const tokenAuth = require('./tokenauth');

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
}

// NOTE: Bodyparser does not handle multipart forms
// using formidable instead

function createThumbnail(filepath, filename, photo) {
    

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
    .get('/', (req, res) => {
        res.render('upload');
    })
    .get('/photos', (req, res) => {
        return Photo.find().sort({ date: -1 }).exec((err, photos) => {
            if(err) {
                console.error(err);
            } else {
                return res.send(photos);
            }
        });
    })

    .get('/page/:page', function(req, res) {
        var pageLength = 20;
        var page = 0;
        if(req.params.page && isNumber(req.params.page)) {
            page = req.params.page - 1;
        }

        return Photo.find()
            .sort({ date: -1 })
            .skip(page * pageLength)
            .limit(pageLength)
            .exec(function(err, photos) {
                if(err) {
                    console.error(err);
                } else {
                    return res.send(photos);
                }
            });
    })

    .post('/photos', isLoggedIn, function(req, res) {
        

        console.log('posted form');
        var photos = [];

        var form = new formidable.IncomingForm();
        var files = [];
        var fields = {};

        form.on('field', function(field, value) {
            fields[field] =  value;
        });

        form.on('file', function(field, file) {
            // TODO: move all processing here for multiple uploads
            console.log(file.name);
            files.push([field, file]);

            // var tempPath = this.openedFiles[i].path;
            var tempPath = file.path;
            var date = new Date();
            // var filename = date.getTime() + '-' + this.openedFiles[i].name;
            var filename = date.getTime() + '-' + file.name;
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
                console.log('success copying ' + filename);
                // create thumbnail
                createThumbnail(newLocation, filename, photo);
            });

            photo.save(function(err) {
                if(err) {
                    console.log(err);
                    return console.error(err);
                }
                console.log('saved ' + filename);
                // res.send(photo);
                photos.push(photo);
            });
        });

        form.on('end', function() {
            // var photos = [];
            // for(var i = 0; i < files.length; i++) {


            // }
            return res.send(photos);
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
    // .post('/autophoto', [bodyParser(), tokenAuth], function(req, res) {
    //     if(req.user) {
    //         console.log('posted form');
    //         var photos = [];

    //         var form = new formidable.IncomingForm();
    //         var files = [];
    //         var fields = {};

    //         form.on('field', function(field, value) {
    //             fields[field] =  value;
    //         });

    //         form.on('file', function(field, file) {
    //             console.log(file.name);
    //             files.push([field, file]);
    //         });

    //         form.on('end', function() {

    //             var tempPath = this.openedFiles[0].path;
    //             var date = new Date();
    //             var filename = date.getTime() + '-' + this.openedFiles[0].name;
    //             var newLocation = path.join(__dirname, '../public/uploads/');

    //             var photo = new Photo({
    //                 path: '/uploads/' + filename,
    //                 caption: fields.caption,
    //                 takenBy: {
    //                     id: req.user._id,
    //                     username: req.user.username
    //                 },
    //                 thumbnail: '/uploads/thumbs/' + filename,
    //                 date: date
    //             });

    //             fs.copy(tempPath, newLocation + filename, function(err) {
    //                 if(err) {
    //                     console.log(err);
    //                     return console.error(err);
    //                 }
    //                 console.log('success');
    //                 // create thumbnail
    //                 createThumbnail(newLocation, filename, photo);
    //             });


    //             return photo.save(function(err) {
    //                 if(err) {
    //                     console.log(err);
    //                     return console.error(err);
    //                 }
    //                 return res.send(photo);
    //             });
    //         });

    //         form.parse(req);
    //     } else {
    //         res.end('No!');
    //     }
    // })

    .get('/photos/:id', function(req, res) {
        // get one photo
        
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