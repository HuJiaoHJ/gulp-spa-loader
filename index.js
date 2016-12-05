'use strict';

var through = require('through2');
var path = require('path');
var fs = require('fs');
var objectAssign = require('object-assign');
var maps = {};
var options = {
    map: '',
    prefix: ''
};

var getIdsByPath = function (p) {
    var ids = [];
    for (var i in maps) {
        if (maps.hasOwnProperty(i) && maps[i].path === p) {
            ids.push(i);
        }
    }
    return ids;
};

var loadDepsPath = function (ids, paths) {
    ids.forEach(function (id) {
        if (!id || !maps[id]) {
            return;
        }
        var dep = maps[id];

        if (dep && dep.deps) {
            loadDepsPath(dep.deps, paths);
        }
        if (paths.indexOf(dep.path) < 0) {
            paths.push(dep.path);
        }
    });
};

var loadDeps = function (file) {
    var filePath = file.path;
    var filename = path.basename(filePath, '.html');
    var dir = path.dirname(filePath);
    // 默认加载同目录下同名js文件
    var p = dir + '/' + filename + '.js';
    var paths = [];

    if (fs.existsSync(p)) {
        p = path.relative(file.base, p);
        var ids = getIdsByPath(p);

        loadDepsPath(ids, paths);
    }
    return paths;
};

module.exports = function (opts) {
    objectAssign(options, opts);
    if (typeof options.map === 'string' && /.json$/.test(options.map)) {
        maps = require(path.resolve(options.map));
    } else if (typeof options.map === 'object') {
        maps = options.map;
    }

    return through.obj(function (file, enc, cb) {
        var deps = loadDeps(file);
        var chunk;
        var tpl;
        var tplPrefix = '<!-- js deps start -->';
        var tplEndfix = '<!-- js deps end -->';
        var R = /<!-- js deps start -->[\s\S]*<!-- js deps end -->/;

        if (deps.length) {
            chunk = String(file.contents);
            tpl = tplPrefix + '\n<script type="text/javascript" src="' + options.prefix + deps.join('"></script>\n<script type="text/javascript" src="' + options.prefix) + '"></script>\n' + tplEndfix;
            if (R.test(chunk)) {
                chunk = chunk.replace(R, tpl);
            } else {
                chunk = chunk + tpl;
            }

            file.contents = new Buffer(chunk);
        }

        cb(null, file);
    });
};
