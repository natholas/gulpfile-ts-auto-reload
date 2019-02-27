const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const tsify = require('tsify')
const sourcemaps = require('gulp-sourcemaps')
const buffer = require('vinyl-buffer')
const browserSync = require('browser-sync').create()
const del = require('del')
const uglify = require('gulp-uglify')

const port = 3030

const sources = {
  pages: ['src/*.html', 'src/**/*.html'],
  scripts: ['src/*.ts', 'src/**/*.ts'],
  assets: ['src/assets/**/*']
}

const dest = './dist'

gulp.task('clean-build-folder', () => {
  return del([dest + '/*'])
})

gulp.task('browser-sync', () => {
  browserSync.init({
    port: port,
    server: {
      baseDir: dest,
    }
  })
})

gulp.task('copy-html', () => {
  return gulp.src(sources.pages)
    .pipe(gulp.dest(dest))
})

gulp.task('copy-assets', () => {
  return gulp.src(sources.assets)
  .pipe(gulp.dest(dest + '/assets'))
})

gulp.task('browserify', () => {
  return browserify({
    basedir: '.',
    debug: true,
    entries: 'src/main.ts',
    cache: {},
    packageCache: {}
  })
    .plugin(tsify)
    .transform('babelify', {
      presets: ['es2015'],
      extensions: ['.ts']
    })
    .bundle()
    .on('error', console.error)
    .pipe(source('script.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dest))
})

gulp.task('uglify-js', () => {
  return gulp.src(dest + '/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(dest))
})

gulp.task('reload-browser', done => {
  browserSync.reload()
  done()
})

gulp.task('watchers', () => {
  gulp.watch(sources.pages, gulp.series('copy-html', 'reload-browser'))
  gulp.watch(sources.scripts, gulp.series('browserify', 'reload-browser'))
  gulp.watch(sources.assets, gulp.series('copy-assets', 'reload-browser'))
})

gulp.task('build-tasks', gulp.series('browserify', 'copy-html', 'copy-assets'))
gulp.task('optimization-tasks', gulp.series('uglify-js'))
gulp.task('build-prod', gulp.series('clean-build-folder', 'build-tasks', 'optimization-tasks'))
gulp.task('server-setup', gulp.parallel('browser-sync', 'watchers'))
gulp.task('default', gulp.series('clean-build-folder', 'browserify', 'copy-html', 'copy-assets', 'server-setup'))