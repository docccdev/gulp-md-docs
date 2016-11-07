var gutil = require('gulp-util');
var _ = require('lodash');
var through = require('through');
var path = require('path');
var marked = require('marked');
var PluginError = gutil.PluginError;
var fs = require('fs');

var renderer = new marked.Renderer();

renderer.heading = function(text, level) {
    var template = _.template('<h${lavel} class="uidocs-title uidocs-title_size_h${lavel}">${text}</h${lavel}>');

    return template({
        lavel: level,
        text: text
    });
}

renderer.paragraph = function(text) {
    var template = _.template('<div class="uidocs-paragraph">${text}</div>');

    return template({text: text});
}

renderer.hr = function() {
    var template = _.template('<div class="uidocs-line"></div>');

    return template();
}

renderer.code = function(code, language) {
    var isPreview = _.includes(language, '+preview');

    if (isPreview) {
        // code = escape(code);
    }

    var template = _.template(`
        <div class="uidocs-example">
            <div class="uidocs-example__label">${language}</div>
            <div class="uidocs-example__value">
                <pre class="uidocs-source"><code class="${language}">${code}</code></pre>
            </div>
        </div>
    `);

    return template({
        code: code,
        language: language,
    });
}

function parseMarkdown(contents) {
    return marked(contents, {
      renderer: renderer,
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false
    })
}

function gulpMarkdownDocs(options) {
    if (!_.isObject(options)) {
        throw new PluginError('gulp-md-docs', 'Missing file argument for gulp-md-docs');
    }

    var baseTemplate = _.template(fs.readFileSync(options.templatePath).toString());
    var collectedDocs = [];
    var navTree = [];

    function parseJSON(string, file){
        try {
            return JSON.parse(string);
        } catch (err) {
            gutil.log(gutil.colors.red('JSON parse failed ' + file.path), err);
        }
    }

    function bufferContents(file) {
        if (file.isNull()) return; // ignore
        if (file.isStream()) return this.emit('error', new PluginError('gulp-markdown-docs',  'Streaming not supported'));

        try {
            var optionRegexp = /<!--([\s\S]*)-->/;
            var contentString = file.contents.toString();
            var splitText = contentString.split(/\n\n/);
            var markdown = splitText.splice(1, splitText.length-1).join('\n\n');
            var markdownOption = optionRegexp.exec(contentString);

            if(markdownOption) {
                var fileOptions = parseJSON(markdownOption[1], file);

                // console.log(fileOptions, file.path);

                var filePath = path.join.apply(null, fileOptions);
                var content = parseMarkdown(markdown);
                var static_path = _.map(fileOptions.slice(1), function(){ return '../'; }).join('');


                _.each(fileOptions, function(value, index) {
                    if(!navTree[index]) {
                        navTree[index] = [];
                    }

                    var currentPath = path.join.apply(null, fileOptions.slice(0, index));
                    var menuData = {
                        content: value,
                        href: path.format({
                          dir: currentPath,
                          name: value,
                          ext: '.html'
                        })
                    };

                    if(!_.find(navTree[index], menuData)) {
                        navTree[index].push(menuData);
                    }
                });

                collectedDocs.push({
                    path: path.format({
                        name: filePath,
                        ext: '.html'
                    }),
                    static_path: static_path,
                    html: content
                });
            }
        } catch (err) {
            gutil.log(gutil.colors.red('ERROR failed to parse api doc ' + file.path +'\n'), err);
        }
    }

    function endStream() {
        var newThis = this;

        _.each(collectedDocs, function(data) {
            try {
                var newFile = new gutil.File({
                    path: data.path,
                    contents: new Buffer(baseTemplate({
                        static_path: data.statc_path,
                        navTree: navTree,
                        content: data.html
                    }))
                });
                newThis.emit('data', newFile);
                gutil.log(gutil.colors.green(data.path));
            } catch (err) {
                gutil.log(gutil.colors.red('ERROR write a file ' + data.path), err);
            }
        });

        console.log(navTree);

        this.emit('end');
    }

  return through(bufferContents, endStream);
};

module.exports = gulpMarkdownDocs;
