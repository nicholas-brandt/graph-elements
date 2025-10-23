const gulp = require('gulp');
const inlineCss = require('gulp-inline-css');

gulp.task('default', function () {
  return gulp.src('src/project.inline.html')
    .pipe(inlineCss({
      applyStyleTags: false,
      removeStyleTags: false,
      removeLinkTags: true
    }))
    .pipe(gulp.dest('dist'));
});