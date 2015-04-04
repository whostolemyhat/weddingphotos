/* GET home page. */
module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('home', {
            user: req.user,
            message: req.flash('loginMessage')
        });
    });
    app.post('/', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    // app.get('/login', function(req, res) {
    //     res.render('login', { message: req.flash('loginMessage') });
    // });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    app.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    });
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));
};
