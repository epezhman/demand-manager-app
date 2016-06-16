'use strict'

const os = require('os')
const gutil = require('gulp-util')
const config = require('./app.local.config')

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

module.exports.awsConfig = ()=> {
    return {
        region: config.AWS_REGION,
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
}
