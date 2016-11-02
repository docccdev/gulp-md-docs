var gutil = require('gulp-util');
var _ = require('lodash');
var through = require('through');
var path = require('path');
var cheerio = require('cheerio');
var marked = require('marked');
var yaml = require('js-yaml');
var PluginError = gutil.PluginError;
var fs = require('fs');
var File = gutil.File;
var highlight = require('highlight.js');

function parseMarkdown(contents) {
    return marked(contents, {
      renderer: new marked.Renderer(),
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

    var TEMPLATE = _.template(fs.readFileSync(options.templatePath).toString());
    var templateValues = {
        headerMenu: Array(),
        content: String()
    };

    var TOP_MENU = [
        {
            href: 'test1',
            text: 'text1'
        },
        {
            href: 'test2',
            text: 'text2'
        }
    ];

    var firstFile = null;
    var collectedDocs = [];

    function bufferContents(file) {
        if (file.isNull()) return; // ignore
        if (file.isStream()) return this.emit('error', new PluginError('gulp-markdown-docs',  'Streaming not supported'));

        var meta, html;
        if (!firstFile) firstFile = file;
        try {
            var split_text = file.contents.toString().split(/\n\n/);
            var markdown = split_text.splice(1, split_text.length-1).join('\n\n');
            var mddoc = split_text[0].match(/<!-- mddoc[\s\S]*?-->/g);

            console.error(mddoc.toString().replace('<!-- mddoc', ''));

            collectedDocs.push({
                // meta: yaml.safeLoad(split_text[0]),
                path: file.path,
                html: parseMarkdown(markdown) 
            });
        } catch (err) {
            gutil.log(gutil.colors.red('ERROR failed to parse api doc ' + file.path +'\n'), err);
        }
    }

    function endStream() {
        joinedFile = firstFile.clone({contents: false});
        joinedFile.contents = new Buffer(collectedDocs[0].html);
        // joinedFile.path = joinedFile.path.replace('.md', '.html');

        // console.error(collectedDocs);

        this.emit('data', joinedFile);

        // if (firstFile) {
        //     var joinedFile = firstFile;


        //     console.error(file.path);

        //     // if (typeof fileOpt === 'string') {
        //     //     joinedFile = firstFile.clone({contents: false});
        //     //     joinedFile.path = path.join(firstFile.base, fileOpt)
        //     // }
        //             // joinedFile.contents = new Buffer($.html());

        // }
        this.emit('end');

    }

  return through(bufferContents, endStream);
};

module.exports = gulpMarkdownDocs;
