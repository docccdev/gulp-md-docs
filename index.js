'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var templateCompiled = compileTemplate(options.templatePath);
    var renderBlock = _lodash2.default.extend(new _marked2.default.Renderer(), templateCompiled.block);
    var styleFile = _fs2.default.readFileSync(options.stylePath);

    var collectedDocs = [];
    var navTree = {};

    function bufferContents(file, i) {
        if (file.isNull()) return;
        if (file.isStream()) return this.emit('error', new _gulpUtil2.default.PluginError(PLUGIN_NAME, 'Streaming not supported'));

        try {
            var markdown = parseMarkdown(file);

            if (markdown.path) {
                var filePath = markdown.path;
                var pathSep = filePath.split(_path2.default.sep);
                var dirPath = _path2.default.dirname(filePath);
                var static_path = _path2.default.relative(dirPath, __dirname);

                _lodash2.default.each(pathSep, function (value, index) {
                    var currentPathSep = pathSep.slice(0, index + 1);
                    var href = formatPathHtml(_path2.default.join.apply(null, currentPathSep));
                    var objectPath = currentPathSep.join('.children.');
                    var currentNav = _lodash2.default.get(navTree, objectPath);

                    if (!currentNav) {
                        _lodash2.default.set(navTree, objectPath, { href: href });
                    }
                });

                collectedDocs.push({
                    path: formatPathHtml(markdown.path),
                    static_path: static_path,
                    html: (0, _marked2.default)(markdown.content, {
                        renderer: renderBlock
                    })
                });
            }
        } catch (err) {
            _gulpUtil2.default.log(_gulpUtil2.default.colors.red('ERROR failed to parse api doc ' + file.path), err);
        }
    }

    function endStream() {
        var _this = this;

        _lodash2.default.each(collectedDocs, function (data) {
            try {
                var newFile = new _gulpUtil2.default.File({
                    path: data.path,
                    contents: new Buffer(templateCompiled.base({
                        static_path: data.static_path,
                        navTree: navTree,
                        content: data.html
                    }))
                });
                _this.emit('data', newFile);
                _gulpUtil2.default.log(_gulpUtil2.default.colors.green(data.path));
            } catch (err) {
                _gulpUtil2.default.log(_gulpUtil2.default.colors.red('ERROR write a file ' + data.path), err);
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
    var optionString = regexp.exec(fileString);

    return {
        path: optionString ? _lodash2.default.trim(optionString[1]) : null,
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