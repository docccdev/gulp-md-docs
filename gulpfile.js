var gulp = require('gulp');
var gulpMdDocs = require('./dist/index.js');

gulp.task('default', function() {
  return gulp.src('example/**/*.md')
    .pipe(gulpMdDocs({
        templates: {
            base: './documentation/resource/template.html',
            block: {
                code: './documentation/resource/block/code.html',
                codespan: './documentation/resource/block/codespan.html',
                hr: './documentation/resource/block/hr.html',
                heading: './documentation/resource/block/heading.html',
                paragraph: './documentation/resource/block/paragraph.html',
                table: './documentation/resource/block/table.html',
                tablerow: './documentation/resource/block/tablerow.html',
                tablecell: './documentation/resource/block/tablecell.html',
            }
        }
    }))
    .pipe(gulp.dest('documentation'));
});

gulp.task('watch', function() {
    gulp.watch('example/**/*.md', function(event) {
        gulp.run('default');
    });
});
