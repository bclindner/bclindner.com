// gulp core
const gulp = require("gulp");
// some aliases for qol
const series = gulp.series;
const parallel = gulp.parallel;
// html
const pug = require("gulp-pug");
// css
const sass = require("gulp-sass");
const cleanCSS = require("gulp-clean-css");
// images
const imagemin = require("gulp-imagemin");
// utils
const pj = require("path").join; // aliasing to pj for ease of use
const bsync = require("browser-sync");
const clean = require("gulp-clean");
const ghpages = require("gulp-gh-pages");

const srcdir = "src";
const destdir = "dist";
const paths = {
  sass: {
    src: pj(srcdir, "**/*.sass"),
    dest: pj(destdir)
  },
  pug: {
    src: pj(srcdir, "**/*.pug"),
    dest: pj(destdir)
  },
  img: {
    src: pj(srcdir, "**/*.{png,jpg,svg,gif}"),
    dest: pj(destdir)
  },
  files: {
    src: pj(srcdir, "static/files/**/*"),
    dest: pj(destdir)
  }
};

// render all Pug to HTML
gulp.task("html", () => {
  return gulp
    .src(paths.pug.src)
    .pipe(pug())
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(bsync.stream());
});

// Render all SASS to CSS
gulp.task("css", () => {
  return gulp
    .src(paths.sass.src)
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.sass.dest))
    .pipe(bsync.stream());
});

// Optimize images in the src dir
gulp.task("img", () => {
  return gulp
    .src(paths.img.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.img.dest))
    .pipe(bsync.stream());
});

// Copy all files to the dist dir
gulp.task("files", () => {
  return gulp
    .src(paths.files.src)
    .pipe(gulp.dest(paths.files.dest))
    .pipe(bsync.stream());
});

// Clean the entire dist folder
gulp.task("clean", () => {
  return gulp.src(destdir, { read: false, allowEmpty: true }).pipe(clean());
});

// Build batch job
gulp.task("build", series("clean", parallel("html", "css", "img", "files")));

// Auto-refreshing dev server
gulp.task(
  "watch",
  series("build", () => {
    // start browsersync server
    bsync.init({
      server: {
        baseDir: destdir
      }
    });
    gulp.watch(paths.pug.src, series("html"));
    gulp.watch(paths.sass.src, series("css"));
    gulp.watch(paths.img.src, series("img"));
    gulp.watch(paths.files.src, series("files"));
  })
);
gulp.task("dev", series("watch"));

// GitHub pages tasks
gulp.task("gh-pages", () => {
  return gulp.src(pj(destdir, "**/*")).pipe(ghpages());
});
gulp.task("move-cname", () => {
  // add CNAME to the build so the redirect doesn't break when we push
  return gulp.src(pj(srcdir, "CNAME")).pipe(gulp.dest(destdir));
});
// deploy to github pages
gulp.task("publish", series("build", "move-cname", "gh-pages"));
gulp.task("deploy", series("publish"));

gulp.task("default", series("build"));
