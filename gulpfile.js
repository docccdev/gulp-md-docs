var gulp = require('gulp');
var gulpMdDocs = require('./index');

gulp.task('default', function() {
  return gulp.src('example/**/*.md')
    .pipe(gulpMdDocs({
        templatePath: 'template/index.html',
    }))
    .pipe(gulp.dest('docs'))
});