gulp-md-docs
=====================
Building navigable HTML documentation from *.md files with code syntax highlighting (via highlight.js), navigation menu and flexible template.

# Installation

```bash
$ npm install gulp-md-docs
```

# Usage

gulpfile.js

```js
var gulp = require('gulp');
var gulpMdDocs = require('gulp-md-docs');

gulp.task('doc', function() {
    return gulp.src('*.md')
        .pipe(gulpMdDocs())
        .pipe(gulp.dest('docs'));
});
``
