'use strict'

const os = require('os')
const gutil = require('gulp-util')
const secrets = require('./secrets.config')
const config = require('./gulp.config')

module.exports.os = ()=> {
    switch (os.platform()) {
        case 'darwin':
            return 'osx'
        case 'linux':
            return 'linux'
        case 'win32':
            return 'windows'
    }
    return 'unsupported'
}


module.exports.log = (msg)=> {
    gutil.log(gutil.colors.blue(msg))
}

module.exports.logError = (msg)=> {
    gutil.log(gutil.colors.red(msg))
}

module.exports.logInfo = (msg)=> {
    gutil.log(gutil.colors.grey(msg))
}

module.exports.awsConfig = ()=> {
    return {
        region: config.awsRegion,
        accessKeyId: secrets.AWS_ACCESS_KEY_ID,
        secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY
    }
}
