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


gulp.task('clean:build', () => {
    return del([
        './dist/**/*'
    ])
})

gulp.task('set-code-signing-vars', function () {
    process.env.CSC_LINK = secrets.CSC_LINK
    process.env.CSC_KEY_PASSWORD = secrets.CSC_KEY_PASSWORD
})

let addBuildVersionFile = (platformDist) => {
    fs.writeFile(baseDistDir + platformDist + config.latestBuildVersionFile,
        config.appVersion)
}

const buildForOS = (platform) => {

    if (platform === 'linux') {
        return Q.fcall(() => {
            if (process.arch === 'x64') {
                utils.log('Building for Linux 64-bit')
                return builder.build({
                    targets: Platform.LINUX.createTarget(null, Arch.x64)
                }).then(() => {
                    let fileName = config.appName + '_' + config.appVersion + '_amd64.deb'
                    mv(baseDistDir + fileName,
                        baseDistDir + config.distLinux64Dir + fileName,
                        {mkdirp: true}, () => {
                            addBuildVersionFile(config.distLinux64Dir)
                        })
                })
            }
            else {
                utils.log('Building for Linux 32-bit')
                return builder.build({
                    targets: Platform.LINUX.createTarget(null, Arch.ia32)
                }).then(() => {
                    let fileName = config.appName + '_' + config.appVersion + '_ia32.deb'
                    mv(baseDistDir + fileName,
                        baseDistDir + config.distLinux32Dir + fileName,
                        {mkdirp: true}, () => {
                            addBuildVersionFile(config.distLinux32Dir)
                        })
                })
            }

        })
    }
    else if (platform === 'windows') {
        return Q.fcall(() => {
            utils.log('Building for Windows 64-bit')
            return builder.build({
                targets: Platform.WINDOWS.createTarget(null, Arch.x64)
            })
        }).then(() => {
            let fileName = config.appProductName + ' Setup ' + config.appVersion + '.exe'
            mv(baseDistDir + fileName,
                baseDistDir + config.distWin64Dir + fileName,
                {mkdirp: true}, () => {
                    addBuildVersionFile(config.distWin64Dir)
                })
            mv(baseDistDir + 'latest.yml', baseDistDir + config.distWin64Dir + 'latest.yml', {}, () => {
            })
        }).then(() => {
            utils.log('Building for Windows 32-bit')
            return builder.build({
                targets: Platform.WINDOWS.createTarget(null, Arch.ia32)
            })
        }).then(() => {
            let fileName = config.appProductName + ' Setup ' + config.appVersion + '.exe'
            mv(baseDistDir + fileName,
                baseDistDir + config.distWin32Dir + fileName,
                {mkdirp: true}, () => {
                    addBuildVersionFile(config.distWin32Dir)
                })
            mv(baseDistDir + 'latest.yml', baseDistDir + config.distWin32Dir + 'latest.yml', {}, () => {
            })
        })
    }
}

gulp.task('build', ['set-code-signing-vars', 'vet', 'sass', 'clean:build'], () => {
    return buildForOS(utils.os())
})
