var gulp    = require('gulp'),
    gutil   = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    nib     = require('nib'),
    rev     = require('gulp-rev'),
    replace = require('gulp-replace'),
    del     = require('del'),
    stylus  = require('gulp-stylus'),
    uglify  = require('gulp-uglify');

var browserify = require('browserify'),
    watchify   = require('watchify'),
    source     = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    buffer     = require('vinyl-buffer');

var debug = process.env.NODE_ENV !== 'production';
var staticDir = './public/';

var browserifyBundler = browserify('./assets/js/app.js', { debug: debug });
var watchifyBundler = watchify(browserifyBundler);

// add any other browserify options or transforms here
// browserifyBundler.transform('brfs');

function compileScripts(options) {
  var bundler = options.watch ? watchifyBundler : browserifyBundler;

  del(staticDir + 'js');

  var bundle = function() {
    var stream = bundler.bundle();

    if (debug) {
      // log errors if they happen
      stream.on('error', gutil.log.bind(gutil, 'Browserify Error'));
    }

    return stream
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(rev())
      .pipe(gulp.dest(staticDir + 'js')) // output the rev'd files
      .pipe(rev.manifest({ base: './public', merge: true }))
      .pipe(gulp.dest(staticDir)); // output the manifest file
  };

  bundler.on('update', bundle);

  return bundle();
}


gulp.task('cachebust', ['compile-css', 'compile-js'], function() {
  var manifest = require('./rev-manifest.json');
  var stream = gulp.src('./views/**/*.ejs');

  Object.keys(manifest)
    .reduce(function(stream, key) {
      // generate a regular expression with this key to grab everything
      // in between the the file name and the extension
      var reg = key.split('.').join('(.+)?\.');
      return stream.pipe(replace(new RegExp(reg), manifest[key]));
    }, stream)
    .pipe(gulp.dest('./views'));
});

gulp.task('compile-css', function() {
  del(staticDir + 'css');

  return gulp.src('./assets/css/app.styl')
    .pipe(stylus({ use: [nib()] }))
    .pipe(rev())
    .pipe(gulp.dest(staticDir + 'css'))
    .pipe(rev.manifest({ base: './public', merge: true }))
    .pipe(gulp.dest(staticDir));
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

gulp.task('build', ['cachebust']);

gulp.task('watch', ['cachebust', 'watch-css', 'watch-js']);

gulp.task('serve', ['watch'], function () {
  nodemon({ script: './bin/www', ext: 'ejs' })
    .on('restart', function () {
      console.log('restarted!')
    });
});

gulp.task('default', ['watch']);
