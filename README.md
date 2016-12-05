# gulp-spa-map

> 解析指定文件中的依赖关系，将依赖对应的js资源写入html文件中

##### options

* type：Object
* 配置项

##### 使用

```
'use strict';

var loader = require('gulp-spa-loader');

module.exports = function (gulp) {
    gulp.task('loader', ['map'], function () {
        var prefixUrl = './';
        var options = {
            map: './src/map.json',
            prefix: prefixUrl
        };
        return gulp.src([
            'src/pages/**/*.html',
            '!src/pages/**/directive/**/*.html',
            '!src/pages/*.html',
            '!src/pages/lib/**/*.html'
        ])
        .pipe(loader(options))
        .pipe(gulp.dest('src/pages/'));
    });
};

```

html文件中被写入一下资源

```
<!-- js deps start -->
<script type="text/javascript" src="./one/directive/oneonedir/oneonedir.js"></script>
<script type="text/javascript" src="./one/directive/onedir/onedir.js"></script>
<script type="text/javascript" src="./one/one.js"></script>
<!-- js deps end -->
```
