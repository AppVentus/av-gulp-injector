'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var finder = require('fs-finder');
var fs = require('fs');
var ginjector = {};


/**
 * Transform path aliases to theirs real path
 */
ginjector.compileAliases = function(str, aliases) {
    for (var alias in aliases) {
        str = str.replace(new RegExp(alias, 'g'), aliases[alias]);
    }

    return str;
};

/**
 * Merge a single injector to the injectorsAssemble
 */
ginjector.mergeInjectors = function (injectorsCollection, injector) {
    for (var tag in injector) {
        if (injector.hasOwnProperty(tag)) {
            var paths = injector[tag];

            /**
             * Foreach values {tag: paths}
             */
            var previousTagValues = [];
            if (typeof(injectorsCollection[tag]) !== 'undefined') {
                previousTagValues = injectorsCollection[tag];
            }

            injectorsCollection[tag] = previousTagValues.concat(paths);
        }
    }

    return injectorsCollection;
};

/**
 * Collect all injector.json and group them into the injectorsCollection
 */
ginjector.injectorsAssemble = function (aliases) {
    // All tags and all paths to inject
    var injectorsCollection = {};

    // get all injector.json locations
    var injectors = finder.from('./').findFiles('injector.json');

    for (var index in injectors) {
        var injector = injectors[index];

        var data = fs.readFileSync(injector, 'utf8');

        if (typeof(aliases) !== 'undefined') {
            data = ginjector.compileAliases(data, aliases);
        }

        injectorsCollection = ginjector.mergeInjectors(injectorsCollection, JSON.parse(data));
    }

    return injectorsCollection;
};

/**
 * Generates a pipe with the injection for one tag
 */
ginjector.tagInjector = function(source, tag, path, relativeInjection) {
    var sources = gulp.src(path, {read: false});

    var injection = $.inject(
        sources, {
            name: tag,
            ignorePath: 'web/',
            relative: relativeInjection,

            /**
             * Transform inject with asset() function
             */
            transform: function(filepath) {
                if (filepath.slice(-3) === '.js') {
                    return '<script src="{{ asset(\'' + filepath + '\') }}"></script>';
                }

                if (filepath.slice(-4) === '.css') {
                    return '<link rel="stylesheet" href="{{ asset(\'' + filepath + '\') }}">';
                }

                if (filepath.slice(-5) === '.scss') {
                    return '@import \'' + filepath + '\';';
                }
            }
        }
    );
    source.pipe(injection);
};

/**
 * Loop over all the tags to inject everything
 */
ginjector.injector = function(src, aliases, relativeInjection) {
    var injectorsCollection = this.injectorsAssemble(aliases);

    if (typeof(relativeInjection) === 'undefined') {
        relativeInjection = false;
    }

    /**
     * Injection for each tags
     */
    for (var tag in injectorsCollection){
        if (injectorsCollection.hasOwnProperty(tag)) {
            this.tagInjector(src, tag, injectorsCollection[tag], relativeInjection);
        }
    }

    /**
     * Same dest as gulp.src
     */
    src.pipe(gulp.dest(function(file) {
        return file.base;
    }));
};

module.exports = ginjector;
