const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const tsify = require('tsify');
const fancy_log = require('fancy-log');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync');

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

const server = browserSync.create();

function reload() {
  server.reload();
}

function serve() {
  server.init({
    server: {
      baseDir: './dist',
    },
  });
}

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
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
}

gulp.task('default', gulp.series(gulp.parallel('copy-html'), bundle, serve));
watchedBrowserify.on('update', () => {
  bundle();
  reload();
});
watchedBrowserify.on('log', fancy_log);
