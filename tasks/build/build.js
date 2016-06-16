'use strict'

const gulp = require('gulp')
const utils = require('../utils')
const vet = require('../vet')

var buildForOs = {
    osx: require('./osx'),
    linux: require('./linux'),
    windows: require('./windows')
}

gulp.task('build', ['vet'], () => {
    return buildForOs[utils.os()]()
})
