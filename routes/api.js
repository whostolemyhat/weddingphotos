var express = require('express');
var router = express.Router();

/* under /api */
router
    .get('/', function(req, res) {
        res.render('views/api');
    })
    .get('/photos', function(req, res) {
        res.writeHead(200);
        res.write('some photos');
        res.end();
    })
    .post('/photos');

module.exports = router;