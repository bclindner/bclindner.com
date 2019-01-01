const gulp = require('gulp')
const series = gulp.series
const parallel = gulp.parallel
// html
const pug = require('gulp-pug')
// css
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
// images
const imagemin = require('gulp-imagemin')
// utils
const bsync = require('browser-sync')
const pj = require('path').join // aliasing to pj for ease of use
const ghpages = require('gulp-gh-pages')

const srcdir = 'src'
const destdir = 'dist'
const paths = {
  sass: {
    src: pj(srcdir, '**/*.sass'),
    dest: pj(destdir)
  },
  pug: {
    src: pj(srcdir, '**/*.pug'),
    dest: pj(destdir)
  },
  img: {
    src: pj(srcdir, '**/*.{png,jpg,svg,gif}'),
    dest: pj(destdir)
  }
}

gulp.task('html', () => {
  return gulp.src(paths.pug.src)
  // convert to html
    .pipe(pug())
  // save to dest
    .pipe(gulp.dest(paths.pug.dest))
  // notify browser-sync of file change
    .pipe(bsync.stream())
})

gulp.task('css', () => {
  return gulp.src(paths.sass.src)
  // convert to css
    .pipe(sass())
  // optimize css
    .pipe(cleanCSS())
  // save to dest
    .pipe(gulp.dest(paths.sass.dest))
  // notify browser-sync of the file change
    .pipe(bsync.stream())
})

gulp.task('img', () => {
  return gulp.src(paths.img.src)
  // minify
    .pipe(imagemin())
  // save to dest
    .pipe(gulp.dest(paths.img.dest))
  // notify browser-sync of the file change
    .pipe(bsync.stream())
})
gulp.task('watch', () => {
  // start browsersync server
  bsync.init({
    server: {
      baseDir: destdir
    }
  })
  // watch for html, css, and image changes
  gulp.watch(paths.pug.src, series('html'))
  gulp.watch(paths.sass.src, series('css'))
  gulp.watch(paths.img.src, series('img'))
})

gulp.task('build', parallel('html', 'css', 'img'))

gulp.task('publish', series('build', () => {
  return gulp.src(pj(destdir, '**/*'))
    .pipe(ghpages())
}))

gulp.task('default', series('build'))
