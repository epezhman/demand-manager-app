'use strict'

const gulp = require('gulp')
const args = require('yargs').argv
const config = require('./gulp.config')

const $ = require('gulp-load-plugins')({lazy: true})

gulp.task('vet', () => {

    return gulp
        .src(config.appjs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'))
        .pipe($.jscs())
})
