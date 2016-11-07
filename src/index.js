import gutil from 'gulp-util';
import _ from 'lodash';
import through from 'through';
import path from 'path';
import marked from 'marked';
import fs from 'fs';

const PLUGIN_NAME = 'gulp-md-docs';

function getTemplate(file_path) {
    try {
        return _.template(fs.readFileSync(file_path, 'utf8'));
    } catch (err) {
        throw new gutil.PluginError(PLUGIN_NAME, err);
    }
}

function compileTemplate(templatePath) {
    if(!_.isObject(templatePath)) {
        templatePath = {};
    }
    if(!_.isObject(templatePath.block)) {
        templatePath.block = {};
    }

    return {
        base: getTemplate(templatePath.base || path.join(__dirname, 'template/base.html')),
        block: {
            code: getTemplate(templatePath.block.code || path.join(__dirname, 'template/block/code.html')),
            hr: getTemplate(templatePath.block.hr || path.join(__dirname, 'template/block/hr.html')),
            heading: getTemplate(templatePath.block.heading || path.join(__dirname, 'template/block/heading.html')),
            paragraph: getTemplate(templatePath.block.paragraph || path.join(__dirname, 'template/block/paragraph.html')),
        }
    }
}

function parseMarkdown(file) {
    const fileString = file.contents.toString();
    const regexp = /<!--([\s\S]*)-->/;
    const splitText = fileString.split(/\n\n/);
    const optionString = regexp.exec(fileString);

    return {
        path: optionString ? _.trim(optionString[1]) : null,
        content: splitText.splice(1, splitText.length-1).join('\n\n'),
    }
}

function formatPathHtml(pathString) {
    return path.format({
        name: pathString,
        ext: '.html'
    });
}

export default function (options = {}) {
    const templateCompiled = compileTemplate(options.templatePath);
    const renderBlock = _.extend(new marked.Renderer(), templateCompiled.block);
    const styleFile = fs.readFileSync(options.stylePath);

    let collectedDocs = [];
    let navTree = {};

    function bufferContents(file, i) {
        if (file.isNull()) return;
        if (file.isStream()) return this.emit('error', new gutil.PluginError(PLUGIN_NAME,  'Streaming not supported'));

        try {
            const markdown = parseMarkdown(file);

            if(markdown.path) {
                var filePath = markdown.path;
                var pathSep = filePath.split(path.sep);
                var dirPath = path.dirname(filePath)
                var static_path = path.relative(dirPath, __dirname);


                _.each(pathSep, function(value, index) {
                    const currentPathSep = pathSep.slice(0, index + 1);
                    const href = formatPathHtml(path.join.apply(null, currentPathSep));
                    const objectPath = currentPathSep.join('.children.');
                    const currentNav = _.get(navTree, objectPath);

                    if (!currentNav) {
                        _.set(navTree, objectPath, { href });
                    }
                });

                collectedDocs.push({
                    path: formatPathHtml(markdown.path),
                    static_path: static_path,
                    html: marked(markdown.content, {
                      renderer: renderBlock,
                    }),
                });
            }
        } catch (err) {
            gutil.log(gutil.colors.red('ERROR failed to parse api doc ' + file.path), err);
        }
    }

    function endStream() {
        _.each(collectedDocs, (data) => {
            try {
                var newFile = new gutil.File({
                    path: data.path,
                    contents: new Buffer(templateCompiled.base({
                        static_path: data.static_path,
                        navTree: navTree,
                        content: data.html
                    }))
                });
                this.emit('data', newFile);
                gutil.log(gutil.colors.green(data.path));
            } catch (err) {
                gutil.log(gutil.colors.red('ERROR write a file ' + data.path), err);
            }
        });

        this.emit('end');
    }

  return through(bufferContents, endStream);
}
