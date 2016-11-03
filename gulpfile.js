var gulp = require('gulp');
var gulpMdDocs = require('./index');

gulp.task('default', function() {
  return gulp.src('example/**/*.md')
    .pipe(gulpMdDocs({
        templatePath: 'docs/template.tpl',
    }))
    .pipe(gulp.dest('docs'));
});

gulp.task('watch', function() {
    gulp.watch('example/**/*.md', function(event) {
        gulp.run('default');
    });
});
