/* GET home page. */
module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('home');
    });

    app.get('/login', function(req, res) {
        res.render('login', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

};
