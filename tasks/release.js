'use strict'

const fs = require('fs')
const path = require('path')
const Q = require('q')
const del = require('del')
const mkdirp = require('mkdirp')
const gulp = require('gulp')
const utils = require('./utils')
const async = require('async')
const config = require('./gulp.config')

const AWS = require('aws-sdk')
AWS.config.update(utils.awsConfig())

const s3 = new AWS.S3({params: {Bucket: config.awsS3BucketName}})

const baseDistDir = config.baseDir + config.distDir

gulp.task('clean:release', ()=> {
    return del([
        './dist/latest-release/**/*'
    ])
})

const platformReleaseDirs = (awsDir, distDir) => {
    let deferred = Q.defer()
    return {
        awsDir: awsDir,
        distDir: distDir,
        deferredPromised: deferred
    }
}

const uploadLatestRelease = (platformDirs)=> {
    let toUploadFiles = []
    toUploadFiles = fs.readdirSync(baseDistDir + platformDirs.distDir)
    let cnt = 0
    if (toUploadFiles.length) {
        async.each(toUploadFiles, (localFile) => {
            let uploadBody = fs.createReadStream(baseDistDir + platformDirs.distDir + localFile)
            utils.logInfo('Uploading: ' + localFile)
            s3.upload({
                Key: config.awsS3UpdateKeyPrefix + platformDirs.awsDir + localFile,
                Body: uploadBody,
                ACL: 'public-read',
                StorageClass: 'REDUCED_REDUNDANCY'
            }).send((err, data) => {
                if (err) {
                    utils.logError(err)
                }
                utils.logInfo('Uploaded: ' + data.Key)
                if (++cnt === toUploadFiles.length) {
                    platformDirs.deferredPromised.resolve()
                }
            })
        })
    }
}

const copyLatestVersionRelease = (platformDirs, version) => {
    s3.listObjects({Prefix: config.awsS3UpdateKeyPrefix + platformDirs.awsDir}, (err, toCopyFiles) => {
        if (err) {
            utils.logError(err)
        }
        let cnt = 0
        if (toCopyFiles.Contents.length) {
            async.each(toCopyFiles.Contents, (s3File) => {
                s3.copyObject({
                    CopySource: config.awsS3BucketName + '/' + s3File.Key,
                    Key: s3File.Key.replace(config.awsS3UpdateKeyPrefix + platformDirs.awsDir,
                        config.awsS3ArchivedUpdateKeyPrefix + 'v' + version + '/' + platformDirs.awsDir),
                    ACL: 'public-read',
                    StorageClass: 'REDUCED_REDUNDANCY'
                }).on('success', () => {
                    utils.logInfo('Copied: ' + s3File.Key)
                    s3.deleteObject({Key: s3File.Key}).on('success', ()=> {
                        utils.logInfo('Deleted: ' + s3File.Key)
                        if (++cnt === toCopyFiles.Contents.length) {
                            uploadLatestRelease(platformDirs)
                        }
                    }).send()
                }).send()
            })
        }
    })
}

const getLatestReleasedVersionAndUploadNewRelease = (platformDirs)=> {
    let latestVersionPath = config.baseDir + config.latestBuildVersionDir + platformDirs.awsDir
    mkdirp.sync(latestVersionPath)
    let latestVersionFileName = latestVersionPath + '/' + config.latestBuildVersionFile
    let latestVersionFile = fs.createWriteStream(latestVersionFileName)
    s3.getObject({
        Key: config.awsS3UpdateKeyPrefix + platformDirs.awsDir + config.latestBuildVersionFile
    }).createReadStream().pipe(latestVersionFile).on('close', ()=> {
        copyLatestVersionRelease(platformDirs, fs.readFileSync(latestVersionFileName))
    })
}

const releaseForOS = (platform) => {
    if (platform === 'linux') {
        if (process.arch === 'x64') {
            return Q.fcall(()=> {
                utils.log('Releasing for Linux 64-bit')
                let pDirs = platformReleaseDirs(config.awsS3Linux64Dir, config.distLinux64Dir)
                getLatestReleasedVersionAndUploadNewRelease(pDirs)
                return pDirs.deferredPromised.promise
            })
        }
        else{
            return Q.fcall(()=> {
                utils.log('Releasing for Linux 32-bit')
                let pDirs = platformReleaseDirs(config.awsS3Linux32Dir, config.distLinux32Dir)
                getLatestReleasedVersionAndUploadNewRelease(pDirs)
                return pDirs.deferredPromised.promise
            })
        }
    }
    else if (platform === 'windows') {
        return Q.fcall(()=> {
            utils.log('Releasing for Windows 64-bit')
            let pDirs = platformReleaseDirs(config.awsS3Win64Dir, config.distWin64Dir)
            getLatestReleasedVersionAndUploadNewRelease(pDirs)
            return pDirs.deferredPromised.promise
        }).then(()=> {
            utils.log('Releasing for Windows 32-bit')
            let pDirs = platformReleaseDirs(config.awsS3Win32Dir, config.distWin32Dir)
            getLatestReleasedVersionAndUploadNewRelease(pDirs)
            return pDirs.deferredPromised.promise
        })
    }
}

gulp.task('release', ['clean:release'], () => {
    return releaseForOS(utils.os())
})