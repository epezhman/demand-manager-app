'use strict'

var fs = require('fs')
var path = require('path')
const Q = require('q')
var del = require('del')
var mkdirp = require('mkdirp')
const gulp = require('gulp')
const utils = require('./utils')
var async = require('async')
const config = require('./gulp.config')

var AWS = require('aws-sdk')
AWS.config.update(utils.awsConfig())

var s3 = new AWS.S3({params: {Bucket: config.awsS3BucketName}})

const baseDistDir = config.baseDir + config.distDir

gulp.task('clean:release', ()=> {
    return del([
        '../dist/latest-release/**/*'
    ])
})

var uploadLatestRelease = (s3PlatformDir, distPlatformDir, deferredPromise)=> {
    var toUploadFiles = []
    toUploadFiles = fs.readdirSync(baseDistDir + distPlatformDir)
    var cnt = 0
    if (toUploadFiles.length) {
        async.each(toUploadFiles, (localFile) => {
            var uploadBody = fs.createReadStream(baseDistDir + distPlatformDir + localFile)
            utils.logInfo('Uploading: ' + localFile)
            s3.upload({
                Key: config.awsS3UpdateKeyPrefix + s3PlatformDir + localFile,
                Body: uploadBody,
                ACL: 'public-read-write',
                StorageClass: 'REDUCED_REDUNDANCY'
            }).send((err, data) => {
                if (err) {
                    utils.logError(err)
                }
                utils.logInfo('Uploaded: ' + data.Key)
                if (++cnt === toUploadFiles.length) {
                    deferredPromise.resolve()
                }
            })
        })
    }
}

var copyLatestVersionRelease = (s3PlatformDir, distPlatformDir, deferredPromise, version) => {
    s3.listObjects({Prefix: config.awsS3UpdateKeyPrefix + s3PlatformDir}, (err, toCopyFiles) => {
        if (err) {
            utils.logError(err)
        }
        var cnt = 0
        if (toCopyFiles.Contents.length) {
            async.each(toCopyFiles.Contents, (s3File) => {
                
                utils.log(config.awsS3ArchivedUpdateKeyPrefix + version + '/' + s3PlatformDir)
                
                s3.copyObject({
                    CopySource: config.awsS3BucketName + s3File.Key,
                    Key: s3File.Key.replace(config.awsS3UpdateKeyPrefix + s3PlatformDir,
                        config.awsS3ArchivedUpdateKeyPrefix + version + '/' + s3PlatformDir),
                    ACL: 'public-read-write',
                    StorageClass: 'REDUCED_REDUNDANCY'
                }).on('success', () => {
                    utils.logInfo('Copied: ' + s3File.Key)
                    s3.deleteObject({Key: s3File.Key}).on('success', ()=> {
                        utils.logInfo('Deleted: ' + s3File.Key)
                        if (++cnt === toCopyFiles.Contents.length) {
                            uploadLatestRelease(s3PlatformDir, distPlatformDir, deferredPromise)
                        }
                    }).send()
                }).on('error', function(response) {
                    console.log(response);
                }).send()
            })
        }
    })
}

var getLatestReleasedVersionAndUploadNewRelease = (s3PlatformDir, distPlatformDir, deferredPromise)=> {
    var latestVersionPath = config.baseDir + config.latestBuildVersionDir + s3PlatformDir
    mkdirp.sync(latestVersionPath)
    var latestVersionFileName = latestVersionPath + '/' + config.latestBuildVersionFile
    var latestVersionFile = fs.createWriteStream(latestVersionFileName)
    s3.getObject({
        Key: config.awsS3UpdateKeyPrefix + s3PlatformDir + config.latestBuildVersionFile
    }).createReadStream().pipe(latestVersionFile).on('close', ()=> {
        copyLatestVersionRelease(s3PlatformDir, distPlatformDir,
            deferredPromise, fs.readFileSync(latestVersionFileName))
    })
}

var releaseForOS = (platform) => {
    if (platform === 'linux') {
        return Q.fcall(()=> {
            utils.log('Releasing for Linux 64-bit')
            var deferred = Q.defer()
            getLatestReleasedVersionAndUploadNewRelease(config.awsS3Linux64Dir, config.distLinux64Dir, deferred)
            return deferred.promise
        }).then(()=> {
            utils.log('Releasing for Linux 32-bit')
            var deferred = Q.defer()
            getLatestReleasedVersionAndUploadNewRelease(config.awsS3Linux32Dir, config.distLinux32Dir, deferred)
            return deferred.promise
        })
    }
    else if (platform === 'osx') {
        utils.log('Releasing for OSX 64-bit')
        var deferred = Q.defer()
        getLatestReleasedVersionAndUploadNewRelease(config.awsS3OSXDir, config.distOSXDir, deferred)
        return deferred.promise
    }
    else if (platform === 'windows') {
        return Q.fcall(()=> {
            utils.log('Releasing for Windows 64-bit')
            var deferred = Q.defer()
            getLatestReleasedVersionAndUploadNewRelease(config.awsS3Win64Dir, config.distWin64Dir, deferred)
            return deferred.promise
        }).then(()=> {
            utils.log('Releasing for Windows 32-bit')
            var deferred = Q.defer()
            getLatestReleasedVersionAndUploadNewRelease(config.awsS3Win32Dir, config.distWin32Dir, deferred)
            return deferred.promise
        })
    }
}

gulp.task('release', ['clean:release'], () => {
    return releaseForOS(utils.os())
})