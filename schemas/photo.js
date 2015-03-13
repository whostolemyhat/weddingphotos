var mongoose = require('mongoose');

// {
//     path: '/path/to/file',
//     date: '2015-02-14',
//     thumbnail: '/path/to/thumbnail',
//     user: 'Alice',
//     caption: 'This is a lovely photo'
// }

var photoSchema = new mongoose.Schema({
    path: String,
    thumbnail: String,
    date: Date,
    takenBy: Number,
    caption: String
});

module.exports = mongoose.model('Photo', photoSchema);