const gulp = require('gulp')
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
const ghpages = require('gh-pages')

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

module.exports = {
  html: () => {
    return gulp.src(paths.pug.src)
      .pipe(pug())
      // convert to html
      .pipe(gulp.dest(paths.pug.dest))
      // save to dest
      .pipe(bsync.stream())
      // notify browser-sync of file change
  },
  css: () => {
    return gulp.src(paths.sass.src)
      // convert to css
      .pipe(sass())
      .pipe(cleanCSS())
      // optimize css
      .pipe(gulp.dest(paths.sass.dest))
      // save to dest
      .pipe(bsync.stream())
      // notify browser-sync of the file change
  },
  img: () => {
    return gulp.src(paths.img.src)
      // minify
      .pipe(imagemin())
      // save to dest
      .pipe(gulp.dest(paths.img.dest))
      // notify browser-sync of the file change
      .pipe(bsync.stream())
  },
  watch: () => {
    // start browsersync server
    bsync.init({
      server: {
        baseDir: destdir
      }
    })
    // watch for html, css, and image changes
    gulp.watch(paths.pug.src, gulp.series('html'))
    gulp.watch(paths.sass.src, gulp.series('css'))
    gulp.watch(paths.img.src, gulp.series('img'))
  },
  publish: (done) => ghpages.publish(destdir, done),
  default: (done) => gulp.parallel('html', 'css', 'img')(done)
}
