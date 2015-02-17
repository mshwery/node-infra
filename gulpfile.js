var gulp   = require('gulp'),
    gutil  = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    nib    = require('nib'),
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify');

var browserify = require('browserify'),
    watchify   = require('watchify'),
    source     = require('vinyl-source-stream');

// var sourcemaps = require('gulp-sourcemaps');
// var buffer = require('vinyl-buffer');

// var app = require('./app');

var debug = process.env.NODE_ENV !== 'production';

var browserifyBundler = browserify('./assets/js/app.js', { debug: debug });
var watchifyBundler = watchify(browserifyBundler);

// add any other browserify options or transforms here
// browserifyBundler.transform('brfs');

function compileScripts(options) {
  var bundler = options.watch ? watchifyBundler : browserifyBundler;

  var bundle = function() {
    var stream = bundler.bundle();

    if (debug) {
      // log errors if they happen
      stream.on('error', gutil.log.bind(gutil, 'Browserify Error'));
    }

    return stream
      .pipe(source('app.js'))
      // // optional, remove if you dont want sourcemaps
      //   .pipe(buffer())
      //   .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      //   .pipe(sourcemaps.write('./')) // writes .map file
      // //
      .pipe(gulp.dest('./public/js'));
  };

  bundler.on('update', bundle);

  return bundle();  
}

gulp.task('compile-css', function() {
  return gulp.src('./assets/css/app.styl')
    .pipe(stylus({ use: [nib()] }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('compile-js', function() {
  compileScripts({ watch: false });
});

gulp.task('watch-css', ['compile-css'], function() {
  gulp.watch('./assets/**/*.styl', ['compile-css']);
});

gulp.task('watch-js', function() {
  compileScripts({ watch: true });
});

gulp.task('build', ['compile-css', 'compile-js']);

gulp.task('watch', ['watch-css', 'watch-js']);

gulp.task('serve', ['watch'], function () {
  nodemon({ script: './bin/www', ext: 'ejs' })
    .on('restart', function () {
      console.log('restarted!')
    });
});

gulp.task('default', ['watch']);
