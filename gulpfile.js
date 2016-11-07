var gulp = require('gulp');
var gulpMdDocs = require('./index.js');

gulp.task('default', function() {
  return gulp.src('example/**/*.md')
    .pipe(gulpMdDocs({
        stylePath: './template/style2.css',
    }))
    .pipe(gulp.dest('docs'));
});

gulp.task('watch', function() {
    gulp.watch('example/**/*.md', function(event) {
        gulp.run('default');
    });
});
