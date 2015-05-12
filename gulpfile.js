var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var server = lr();
var minifyCSS = require('gulp-minify-css');
var embedlr = require('gulp-embedlr');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');

// TODO: lint server code

gulp.task('vendor', function() {
    gulp.src([
        'public/js/lib/jquery-2.1.3.min.js',
        'public/js/lib/underscore-min.js',
        'public/js/lib/backbone-min.js',
        'public/js/lib/*.js'
    ])
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('public/build/js'))
        .pipe(refresh(server));

    // copy maps
    gulp.src(['public/js/lib/*.map'])
        .pipe(gulp.dest('public/build/js/'));
});

gulp.task('js', function() {
    gulp.src([
        'public/js/models/*.js',
        'public/js/views/*.js',
        'public/js/collections/*.js',
        'public/js/*.js',
        '!public/js/upload.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/build/js'))
        .pipe(refresh(server));
});

gulp.task('sass', function() {
    gulp.src('./public/sass/**/*.scss')
        .pipe(watch('./public/sass/*.scss'))
        .pipe(sass())
        // .pipe(gulp.dest('./public/css'))
        .pipe(autoprefixer('last 2 versions', 'ie 9'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./public/build/css'))
        .pipe(refresh(server));
    
    gulp.src('./public/sass/**/*.css')
        .pipe(watch('./public/sass/*.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./public/build/css'))
        .pipe(refresh(server));
});

gulp.task('lr-server', function() {
    server.listen(35729, function(err) {
        if(err) {
            return console.error(err);
        }
    });
});

gulp.task('html', function() {
    gulp.src('views/**/*.handlebars')
        .pipe(embedlr())
        .pipe(refresh(server));
});

gulp.task('default', function() {
    gulp.run('lr-server', 'sass', 'vendor', 'js', 'html');

    gulp.watch('public/sass/**/*.scss', function(e) {
        gulp.run('sass');
    });

    gulp.watch('public/js/**/*.js', function(e) {
        gulp.run('js');
    });

    gulp.watch('views/**/*.handlebars', function(e) {
        gulp.run('html');
    });
});