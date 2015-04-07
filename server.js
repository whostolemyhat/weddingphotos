var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var jwt = require('jwt-simple');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');

// var routes = require('./controllers/index');
var users = require('./controllers/users');
var api = require('./controllers/api');
var admin = require('./controllers/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
var handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, 'views/layouts')
    });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

var sessionConfig = require('./config/session');
app.use(session({
    secret: sessionConfig.secret,
    resave: false,
    saveUninitialized: true
}));
// api token
app.set('jwtTokenSecret', sessionConfig.secret);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// app.use('/', routes);
require('./controllers/index')(app, passport);
app.use('/users', users);
app.use('/api', api);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
