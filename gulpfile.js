var gulp = require('gulp');
var gulpMdDocs = require('./dist/index.js');
var copy = require('gulp-contrib-copy');

var docTemplate = require('./doc_src/index.js');


gulp.task('copy_template_root_dir', function() {
    return gulp.src(docTemplate.root_dir + '/**/*')
        .pipe(copy())
        .pipe(gulp.dest('doc_dist'));
});

gulp.task('compile_doc', function() {
    return gulp.src('doc_md/**/*.md')
        .pipe(gulpMdDocs({
            template: docTemplate
        }))
        .pipe(gulp.dest('doc_dist'));
});

gulp.task('default', ['copy_template_root_dir', 'compile_doc']);


gulp.task('watch', function() {
    gulp.watch('doc_md/**/*.md', ['copy_template_root_dir', 'compile_doc']);
});
