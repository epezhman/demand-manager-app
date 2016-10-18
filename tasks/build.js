'use strict'

const fs = require('fs')
const gulp = require('gulp')
const Q = require('q')
const mv = require('mv')
const del = require('del')
const rmdir = require('rimraf')
const builder = require('electron-builder')
const Platform = builder.Platform
const Arch = builder.Arch

const secrets = require('./secrets.config')
const utils = require('./utils')
const config = require('./gulp.config.js')
const vet = require('./vet')

const baseDistDir = config.baseDir + config.distDir


gulp.task('clean:build', ()=> {
    return del([
        './dist/**/*'
    ])
})

gulp.task('set-code-signing-vars', function () {
    process.env.CSC_LINK = secrets.CSC_LINK
    process.env.CSC_KEY_PASSWORD = secrets.CSC_KEY_PASSWORD
})

var addBuildVersionFile = (platformDist)=> {
    fs.writeFile(baseDistDir + platformDist + config.latestBuildVersionFile,
        config.appVersion)
}

var buildForOS = (platform) => {

    if (platform === 'linux') {
        return Q.fcall(()=> {
            utils.log('Building for Linux 64-bit')
            return builder.build({
                targets: Platform.LINUX.createTarget(null, Arch.x64),
                devMetadata: {
                    'build': {
                        'asar': false
                    }
                }
            }).then(()=> {
                var fileName = config.appName + '-' + config.appVersion + '.deb'
                mv(baseDistDir + fileName,
                    baseDistDir + config.distLinux64Dir + fileName,
                    {mkdirp: true}, () => {
                        addBuildVersionFile(config.distLinux64Dir)
                    })
            })
        }).then(()=> {
            utils.log('Building for Linux 32-bit')
            return builder.build({
                targets: Platform.LINUX.createTarget(null, Arch.ia32),
                devMetadata: {
                    'build': {
                        'asar': false
                    }
                }
            }).then(()=> {
                var fileName = config.appName + '-' + config.appVersion + '-ia32.deb'
                mv(baseDistDir + fileName,
                    baseDistDir + config.distLinux32Dir + fileName,
                    {mkdirp: true}, ()=> {
                        addBuildVersionFile(config.distLinux32Dir)
                    })
            })
        })
    }
    else if (platform === 'osx') {
        return Q.fcall(()=> {
            utils.log('Building for OSX 64-bit')
            return builder.build({
                targets: Platform.OSX.createTarget(),
                devMetadata: {
                    'build': {
                        'asar': false
                    }
                }
            })
        }).then(()=> {
            rmdir(baseDistDir + config.distOSXDir + config.appProductName + '.app', () => {
            })
            addBuildVersionFile(config.distOSXDir)
        })
    }
    else if (platform === 'windows') {
        return Q.fcall(()=> {
            utils.log('Building for Windows 64-bit')
            return builder.build({
                targets: Platform.WINDOWS.createTarget(null, Arch.x64),
                devMetadata: {
                    'build': {
                        'win': {
                            'remoteReleases': ''
                        }
                    }
                }
            })
        }).then(()=> {
            addBuildVersionFile(config.distWin64Dir)
        }).then(()=> {
            utils.log('Building for Windows 32-bit')
            return builder.build({
                targets: Platform.WINDOWS.createTarget(null, Arch.ia32),
                devMetadata: {
                    'build': {
                        'win': {
                            'remoteReleases': ''
                        }
                    }
                }
            })
        }).then(()=> {
            addBuildVersionFile(config.distWin32Dir)
        })
    }
}

gulp.task('build', ['set-code-signing-vars', 'vet', 'sass', 'clean:build'], () => {
    return buildForOS(utils.os())
})
