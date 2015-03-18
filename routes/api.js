var express = require('express');
var router = express.Router();
var Photo = require('../schemas/photo');
var formidable = require('formidable');
var fs = require('fs-extra');
var lwip = require('lwip');
var path = require('path');

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
    // json/base64 form
    // .post('/photos', function(req, res) {
    //     'use strict';

    //     console.log('posted form');

    //     var data_url = req.body.fileData;
    //     //strip out all of the meta data otherwise write fails
    //     var matches = data_url.match(/^data:.+\/(.+);base64,(.*)$/);
    //     var base64_data = matches[2];

    //     var buffer = new Buffer(base64_data, 'base64');
    //     var date = new Date();
    //     var filename = date.getTime() + '-' + req.body.fileName;
    //     var newLocation = 'public/uploads/';

    //     fs.writeFile(newLocation + filename, buffer, function(err) {
    //         console.log('writing file');
    //         if(err) {
    //             console.error(err);
    //         } else {
    //             console.log('success');

    //             // create thumbnail
    //             createThumbnail(newLocation, filename);
    //         }
    //     });

    //     var photo = new Photo({
    //         path: '/uploads/' + filename,
    //         caption: req.body.caption,
    //         takenBy: req.body.takenBy,
    //         thumbnail: '/uploads/thumbs/' + filename,
    //         date: date
    //     });

    //     return photo.save(function(err) {
    //         if(err) {
    //             console.error(err);
    //         } else {
    //             return res.send(photo);
    //         }
    //     });
    // })
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
            var newLocation = path.join(__dirname, 'public/uploads/');


            // fs.copySync(tempPath, newLocation + filename, function(err) {
            copyFile(tempPath, newLocation + filename, function(err) {
                if(err) {
                    console.log(err);
                    return console.error(err);
                }
                console.log('success');
                // create thumbnail
                createThumbnail(newLocation, filename);
            });

            var photo = new Photo({
                path: '/uploads/' + filename,
                caption: fields.caption,
                takenBy: fields.takenBy,
                thumbnail: '/uploads/thumbs/' + filename,
                date: date
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

function createThumbnail(path, filename) {
    'use strict';
    lwip.open(path + filename, function(err, image) {
        if(err) {
            console.error(err);
        } else {
            image.batch()
                .scale(0.5)
                .crop(200, 200)
                .writeFile('public/uploads/thumbs/' + filename, function(err) {
                    if(err) {
                        console.error(err);
                    } else {
                        console.log('successfully created thumbnail');
                    }
                });
        }
    });
}

function copyFile(source, target, callback) {
    'use strict';
    var called = false;

    var read = fs.createReadStream(source);
    read.on('error', function(err) {
        done(err);
    });

    var write = fs.createWriteStream(target);
    write.on('error', function(err) {
        done(err);
    });
    write.on('close', function(ex) {
        done();
    });
    read.pipe(write);

    function done(err) {
        if(!called) {
            callback(err);
            called = true;
        }
    }
}

module.exports = router;