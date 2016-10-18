'use strict'

const gulp = require('gulp')
const args = require('yargs').argv
const config = require('./gulp.config')

const _ = require('gulp-load-plugins')({lazy: true})

gulp.task('vet', () => {

    return gulp
        .src(config.appjs)
        .pipe(_.if(args.verbose, _.print()))
        .pipe(_.jshint())
        .pipe(_.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe(_.jshint.reporter('fail'))
        .pipe(_.jscs())
})
