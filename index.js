'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var templateCompiled = compileTemplate(options.templatePath);
    var renderBlock = _lodash2.default.extend(new _marked2.default.Renderer(), templateCompiled.block);

    var collectionDocs = [];
    var navTree = {};
    var navIndex = {};

    function bufferContents(file) {
        if (file.isNull()) return;
        if (file.isStream()) return this.emit('error', new _gulpUtil2.default.PluginError(PLUGIN_NAME, 'Streaming not supported'));

        try {
            var markdown = parseMarkdown(file);

            if (markdown.path) {
                (function () {
                    var filePath = markdown.path;
                    var filePathArray = filePath.split(_path2.default.sep);
                    var dirPath = _path2.default.dirname(filePath);
                    var basePath = _path2.default.relative(dirPath, __dirname);

                    _lodash2.default.each(filePathArray, function (value, index) {
                        var currentFilePathArray = filePathArray.slice(0, index + 1);
                        var href = formatPathHtml(_path2.default.join.apply(null, currentFilePathArray));
                        var objectPath = currentFilePathArray.join('.children.');
                        var currentNav = _lodash2.default.get(navTree, objectPath);

                        if (!currentNav) {
                            _lodash2.default.set(navTree, objectPath, { href: href, value: value });
                        }
                    });

                    if (markdown.sortIndex) {
                        _lodash2.default.set(navIndex, filePathArray.join('.children.'), { sortIndex: markdown.sortIndex });
                    }

                    collectionDocs.push({
                        path: filePath,
                        pathArray: filePathArray,
                        basePath: basePath,
                        content: (0, _marked2.default)(markdown.content, {
                            renderer: renderBlock
                        })
                    });
                })();
            }
        } catch (err) {
            _gulpUtil2.default.log(_gulpUtil2.default.colors.red('ERROR failed to parse ' + file.path), err);
        }
    }

    function endStream() {
        var _this = this;

        _lodash2.default.each(collectionDocs, function (data) {
            try {
                (function () {
                    var filePath = formatPathHtml(data.path);
                    var navTreeActive = {};

                    _lodash2.default.each(data.pathArray, function (value, index) {
                        var currentFilePathArray = data.pathArray.slice(0, index + 1);
                        var objectPath = currentFilePathArray.join('.children.');

                        _lodash2.default.set(navTreeActive, objectPath, { active: true });
                    });

                    var newFile = new _gulpUtil2.default.File({
                        path: filePath,
                        contents: new Buffer(templateCompiled.base({
                            basePath: data.basePath,
                            navTree: _lodash2.default.merge(navTreeActive, navIndex, navTree),
                            content: data.content
                        }))
                    });
                    _this.emit('data', newFile);
                    _gulpUtil2.default.log(_gulpUtil2.default.colors.green(filePath));
                })();
            } catch (err) {
                _gulpUtil2.default.log(_gulpUtil2.default.colors.red('ERROR write a file ' + filePath), err);
            }
        });
        this.emit('end');
    }

    return (0, _through2.default)(bufferContents, endStream);
};

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _through = require('through');

var _through2 = _interopRequireDefault(_through);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PLUGIN_NAME = 'gulp-md-docs';

function getTemplate(file_path) {
    try {
        return _lodash2.default.template(_fs2.default.readFileSync(file_path, 'utf8'));
    } catch (err) {
        throw new _gulpUtil2.default.PluginError(PLUGIN_NAME, err);
    }
}

function compileTemplate(templatePath) {
    if (!_lodash2.default.isObject(templatePath)) {
        templatePath = {};
    }
    if (!_lodash2.default.isObject(templatePath.block)) {
        templatePath.block = {};
    }

    return {
        base: getTemplate(templatePath.base || _path2.default.join(__dirname, 'template/base.html')),
        block: {
            code: getTemplate(templatePath.block.code || _path2.default.join(__dirname, 'template/block/code.html')),
            hr: getTemplate(templatePath.block.hr || _path2.default.join(__dirname, 'template/block/hr.html')),
            heading: getTemplate(templatePath.block.heading || _path2.default.join(__dirname, 'template/block/heading.html')),
            paragraph: getTemplate(templatePath.block.paragraph || _path2.default.join(__dirname, 'template/block/paragraph.html'))
        }
    };
}

function parseMarkdown(file) {
    var fileString = file.contents.toString();
    var regexp = /<!--([\s\S]*)-->/;
    var splitText = fileString.split(/\n\n/);
    var optionArray = regexp.exec(fileString) || [];
    var optionString = _lodash2.default.trim(optionArray[1]);
    var optionSplit = optionString.split('|');

    return {
        path: optionSplit[0],
        sortIndex: Number(optionSplit[1]),
        content: splitText.splice(1, splitText.length - 1).join('\n\n')
    };
}

function formatPathHtml(pathString) {
    return _path2.default.format({
        name: pathString,
        ext: '.html'
    });
}

module.exports = exports['default'];
