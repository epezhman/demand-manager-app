'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')()

var $ = require('gulp-load-plugins')({lazy: true})

gulp.task('vet', function () {

    return gulp
        .src(config.appjs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'))
        .pipe($.jscs());
});
