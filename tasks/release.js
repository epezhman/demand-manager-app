'use strict'

var fs = require('fs');
var path = require('path');

const gulp = require('gulp')
const Q = require('q')
const utils = require('./utils')
var async = require('async');

var AWS = require('aws-sdk')
AWS.config.update(utils.awsConfig())

var releaseWin64 = () => {
    var deferred = Q.defer()
    fs.exists(path.resolve(__dirname, '..', 'dist/win'), function (exists) {
        if(exists)
        {
            utils.log('Releasing Windows 64-bit')
            var s3 = new AWS.S3({params: {Bucket: 'demand-manager-resources'}});

            // var params = {
            //     Bucket: 'demand-manager-resources', /* required */
            //     CopySource: 'STRING_VALUE', /* required */
            //     Key: 'STRING_VALUE', /* required */
            //     ACL: 'public-read-write',
            //     ServerSideEncryption: 'aws:kms',
            //     StorageClass: 'REDUCED_REDUNDANCY'
            // };
            var done = function(err, data) {
                if (err) console.log(err);
                else console.log(data);
            };
            s3.listObjects({Prefix: 'updates/latest/win32/'}, function(err, data) {
                if (data.Contents.length) {
                    async.each(data.Contents, function(file, cb) {
                        var params = {
                            CopySource: 'demand-manager-resources' + '/' + file.Key,
                            Key: file.Key.replace('updates/latest/win32/', 'updates/111/win32/')
                        };
                        s3.copyObject(params, function(copyErr, copyData){
                            if (copyErr) {
                                console.log(err);
                            }
                            else {
                                console.log('Copied: ', params.Key);
                                cb();
                            }
                        });
                    }, done);
                }
            });

            // s3.copyObject(params, function (err, data) {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else     console.log(data);           // successful response
            // });

        }
        deferred.resolve()
    });
    



    return deferred.promise
}


var releaseWin32 = () => {

}


var releaseLinux64 = () => {

}


var releaseLinux32 = () => {

}


var releaseOSX64 = () => {

}


gulp.task('release', () => {

    return new Q()
        .then(releaseWin64)
        .then(releaseWin32)
        .then(releaseLinux64)
        .then(releaseLinux32)
        .then(releaseOSX64)
        .catch(console.error)

})
