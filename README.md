# av-gulp-injector
A nodeJs / gulp module in complement of gulp-asset to automatically import
assets to your files

## Pre-requesite
This node.js modules provide a function design to be implemented into a
[gulp.js](https://github.com/gulpjs/gulp) task, please refer on [the doc to
learn more about gulp](http://gulpjs.com/).

## Download
You can download the node package via [npm](https://github.com/npm/npm)
```sh
npm install --save-dev av-gulp-injector
```

## Usage
Av-gulp-injector embeds [gulp inject](https://www.npmjs.com/package/gulp-inject)
, limit its usage to the AppVentus Workflow's needs (oriented Symfony)
and add features like json imports and path aliases.

### Basics
Av-gulp-injector will look for JSON files named `injector.json` all over your
architecture. The content of thoses files must be on this model :
```JSON
{
    "tag": [
        "path/to/an/asset.js",
        "path/to/an/asset.css",
    ],
    ...
}
```

Running the gulp task below will make av-gulp-injector looking for all the
`injector.json` files and import the dependencies listed into the gulp.src
object parameter of the `avInjector.injector()` method.

```javascript
var gulp = require('gulp');
var avInjector = require('av-gulp-injector');

gulp.task('injector', function() {
    avInjector.injector(gulp.src('index.html'));
});
```

The importation works with tag, that means that the template which will receive
the assets to inject has to have comments to show where to import assets.
(Please refer to the [gulp inject](https://www.npmjs.com/package/gulp-inject)
doc for more details).

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Acme</title>

        <!-- tag:css -->
        <!-- endinject -->

        <!-- tag:js -->
        <!-- endinject -->
    </head>

    <body></body>
</html>
```

### Aliases
Into your `injector.json` you can use aliases that will avoid you to specify
a part of the path. During the importation the alias will be replace by the real
path partial.

It can be usefull if you develop a component that can be available with bower or
npm and you don't know where the location of the `bower_components` or
`node_modules` folders.

For example I have a `injector.json` file like this one :
```JSON
{
    "head": [
        "@bower/my-component/style.css",
    ],
}
```

If you want to inject the `style.css` referenced with a `@bower` alias, you have
to create an javascript object that will be passed as second argument of the
method `avInjector.injector()` as shown below;

```javascript
var gulp = require('gulp');
var avInjector = require('av-gulp-injector');

var injectorAliases = {
    '@bower': 'bower_components',
}

gulp.task('injector', function() {
    avInjector.injector(gulp.src('index.html'), injectorAliases);
});
```

The task injector will import the file at the path
`bower_components/my-component/style.css`

### File import
As this workflow is made for Symfony2 the import of css and html files will be
with a path wrapped by the function `asset()`, and paths that starts with `web/`
will be cut off the web folder reference.

Av-gulp-injector supports  injection into `.html.twig` & `scss` files.

You can pass a third argument into the `avInjector.injector()` method that is a
boolean for setting the path injections in relative way. By default, this
argument is `false`.
