var gulp = require('gulp');
var gulpMdDocs = require('./dist/index.js');
var copy = require('gulp-contrib-copy');
var stylus = require('gulp-stylus');
var autoprefixer = require('autoprefixer-stylus');

var docTemplate = require('./doc_src/index.js');

gulp.task('compile_doc_css', function () {
    return gulp.src('./doc_src/styl/doc.styl')
        .pipe(stylus({
            compress: true,
            use: [autoprefixer('last 5 versions')]
        }))
        .pipe(gulp.dest('./doc_src/__root/css'));
});

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
    gulp.watch('doc_md/**/*.md', ['compile_doc', 'copy_template_root_dir']);
    gulp.watch('doc_src/styl/**/*.styl', ['compile_doc_css', 'copy_template_root_dir']);
});
