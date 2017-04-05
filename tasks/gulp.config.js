'use strict'

const path = require('path')

const appPackage = require('../app/package.json')

module.exports = {
    // All js which is needed to be vet
    appjs: [
        './app/**/*.js',
        '!./app/node_modules/**',
        '!./app/assets/bower_components/**',
        './tasks/**/*.js'
    ],
    appVersion: appPackage.version,
    appName: appPackage.name,
    appProductName: appPackage.productName,
    appRepo: 'https://github.com/epezhman/demand-manager-app',
    awsRegion: 'eu-central-1',
    awsS3BucketName: 'demand-manager-resources',
    awsS3UpdateKeyPrefix: 'updates/latest/',
    awsS3ArchivedUpdateKeyPrefix: 'updates/older/',
    awsS3Win64Dir: 'win_x64/',
    awsS3Win32Dir: 'win_ia32/',
    awsS3Linux64Dir: 'linux64/',
    awsS3Linux32Dir: 'linux32/',
    baseDir: path.resolve(__dirname, '..') + '/',
    distDir: 'dist/',
    distWin64Dir: 'win/',
    distWin32Dir: 'win-ia32/',
    distLinux64Dir: 'linux-release/',
    distLinux32Dir: 'linux-ia32-release/',
    latestBuildVersionFile: 'buildVersion',
    latestBuildVersionDir: 'dist/latestReleased/',
    latestWin32Release: 'https://s3.eu-central-1.amazonaws.com/demand-manager-resources/updates/latest/win32',
    latestWin64Release: 'https://s3.eu-central-1.amazonaws.com/demand-manager-resources/updates/latest/win64'
}