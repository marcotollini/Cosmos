const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const tsify = require('tsify');
const fancy_log = require('fancy-log');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');

const paths = {
  pages: ['src/*.html'],
};

const watchedBrowserify = watchify(
  browserify({
    basedir: '.',
    debug: true,
    entries: ['src/main.ts'],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);

gulp.task('copy-html', () => {
  return gulp.src(paths.pages).pipe(gulp.dest('dist'));
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .on('error', fancy_log)
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
}

gulp.task('default', gulp.series(gulp.parallel('copy-html'), bundle));
watchedBrowserify.on('update', () => {
  bundle();
});
watchedBrowserify.on('log', fancy_log);
