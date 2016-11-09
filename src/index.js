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
    const optionArray = regexp.exec(fileString) || [];
    const optionString = _.trim(optionArray[1]);
    const optionSplit = optionString.split('|');

    return {
        path: optionSplit[0],
        sortIndex: Number(optionSplit[1]),
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

    const collectionDocs = [];
    const navTree = {};
    const navIndex = {};

    function bufferContents(file) {
        if (file.isNull()) return;
        if (file.isStream()) return this.emit('error', new gutil.PluginError(PLUGIN_NAME,  'Streaming not supported'));

        try {
            const markdown = parseMarkdown(file);

            if(markdown.path) {
                const filePath = markdown.path;
                const filePathArray = filePath.split(path.sep);
                const dirPath = path.dirname(filePath)
                const basePath = path.relative(dirPath, __dirname);

                _.each(filePathArray, (value, index) => {
                    const currentFilePathArray = filePathArray.slice(0, index + 1);
                    const href = formatPathHtml(path.join.apply(null, currentFilePathArray));
                    const objectPath = currentFilePathArray.join('.children.');
                    const currentNav = _.get(navTree, objectPath);

                    if (!currentNav) {
                        _.set(navTree, objectPath, { href, value });
                    }
                });

                if(markdown.sortIndex) {
                    _.set(navIndex, filePathArray.join('.children.'), { sortIndex: markdown.sortIndex});
                }

                collectionDocs.push({
                    path: filePath,
                    pathArray: filePathArray,
                    basePath: basePath,
                    content: marked(markdown.content, {
                        renderer: renderBlock,
                    }),
                });
            }
        } catch (err) {
            gutil.log(gutil.colors.red('ERROR failed to parse ' + file.path), err);
        }
    }

    function endStream() {
        _.each(collectionDocs, (data) => {
            try {
                const filePath = formatPathHtml(data.path);
                const navTreeActive = {};

                _.each(data.pathArray, (value, index) => {
                    const currentFilePathArray = data.pathArray.slice(0, index + 1);
                    const objectPath = currentFilePathArray.join('.children.');

                    _.set(navTreeActive, objectPath, { active: true });
                });

                const newFile = new gutil.File({
                    path: filePath,
                    contents: new Buffer(templateCompiled.base({
                        basePath: data.basePath,
                        navTree: _.merge(navTreeActive, navIndex, navTree),
                        content: data.content
                    }))
                });
                this.emit('data', newFile);
                gutil.log(gutil.colors.green(filePath));
            } catch (err) {
                gutil.log(gutil.colors.red('ERROR write a file ' + filePath), err);
            }
        });
        this.emit('end');
    }

  return through(bufferContents, endStream);
}
