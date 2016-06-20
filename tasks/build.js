'use strict'

const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const Q = require('q')
const builder = require('electron-builder')
const Platform = builder.Platform
const Arch = builder.Arch

const utils = require('./utils')
const config = require('./gulp.config.js')
const vet = require('./vet')


var buildForOS = (platform) => {

    if (platform === 'linux') {
        return Q.fcall(()=> {
            utils.log('Building for Linux 64-bit')
            return builder.build({
                targets: Platform.LINUX.createTarget(null, Arch.x64)
            })
        }).then(()=> {
            return fs.writeFile(config.baseDir + config.distDir + config.distLinux64Dir + config.latestBuildVersionFile,
                'v' + config.appVersion)
        }).then(()=> {
            return builder.build({
                targets: Platform.LINUX.createTarget(null, Arch.ia32)
            })
        }).then(()=> {
            return fs.writeFile(config.baseDir + config.distDir + config.distLinux32Dir + config.latestBuildVersionFile,
                'v' + config.appVersion)
        })
    }
    else if (platform === 'osx') {
        return Q.fcall(()=> {
            utils.log('Building for OSX 64-bit')
            return builder.build({
                targets: Platform.OSX.createTarget()
            })
        }).then(()=> {
            return fs.writeFile(config.baseDir + config.distDir + config.distOSXDir + config.latestBuildVersionFile,
                'v' + config.appVersion)
        })
    }
    else if (platform === 'windows') {
        return Q.fcall(()=> {
            utils.log('Building for Windows 64-bit')
            return builder.build({
                targets: Platform.WINDOWS.createTarget(null, Arch.x64),
                devMetadata: {}
            })
        }).then(()=> {
            return fs.writeFile(config.baseDir + config.distDir + config.distWin64Dir + config.latestBuildVersionFile,
                'v' + config.appVersion)
        }).then(()=> {
            utils.log('Building for Windows 32-bit')
            return builder.build({
                targets: Platform.WINDOWS.createTarget(null, Arch.ia32)
            })
        }).then(()=> {
            return fs.writeFile(config.baseDir + config.distDir + config.distWin32Dir + config.latestBuildVersionFile,
                'v' + config.appVersion)
        })
    }
}

gulp.task('build', ['vet'], () => {
    return buildForOS(utils.os())
})
