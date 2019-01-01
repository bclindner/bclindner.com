// gulp core
const gulp = require('gulp')
// some aliases for qol
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
const pj = require('path').join // aliasing to pj for ease of use
const bsync = require('browser-sync')
const clean = require('gulp-clean')
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
    .pipe(pug())
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(bsync.stream())
})

gulp.task('css', () => {
  return gulp.src(paths.sass.src)
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.sass.dest))
    .pipe(bsync.stream())
})

gulp.task('img', () => {
  return gulp.src(paths.img.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.img.dest))
    .pipe(bsync.stream())
})

gulp.task('clean', () => {
  return gulp.src(destdir, {read: false})
    .pipe(clean())
})

gulp.task('build', series('clean', parallel('html', 'css', 'img')))

gulp.task('watch', series('build', () => {
  // start browsersync server
  bsync.init({
    server: {
      baseDir: destdir
    }
  })
  gulp.watch(paths.pug.src, series('html'))
  gulp.watch(paths.sass.src, series('css'))
  gulp.watch(paths.img.src, series('img'))
}))
gulp.task('dev', series('watch'))

// deploy to github pages
gulp.task('publish', series('build', () => {
  // add CNAME to the build so the redirect doesn't break when we push
  return gulp.src(pj(srcdir, 'CNAME'))
    .pipe(gulp.dest(destdir))
}, () => {
  return gulp.src(pj(destdir, '**/*'))
    .pipe(ghpages())
}))
gulp.task('deploy', series('publish'))

gulp.task('default', series('build'))
