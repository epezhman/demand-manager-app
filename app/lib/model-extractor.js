'use strict'

const config = require('../config')
const log = require('./log')

module.exports = getComputerModel

function getValue()
{
    const wmic = require('ms-wmic');

    wmic.execute('csproduct get vendor', function (err, stdOut) {
        if (err) {
            console.error(err)
        }
        log(stdOut)
    })

}

function getComputerModelWindows() {


    // wmic.execute('csproduct get vendor', function (err, stdOut) {
    //     if (err) {
    //         console.error(err)
    //     }
    //     log(stdOut)
    // })
    // wmic.execute('csproduct get version', function (err, stdOut) {
    //     if (err) {
    //         console.error(err)
    //     }
    //     log(stdOut)
    // })
    // wmic.execute('computersystem get name', function (err, stdOut) {
    //     if (err) {
    //         console.error(err)
    //     }
    //     log(stdOut)
    // })
    // wmic.execute('computersystem get manufacturer', function (err, stdOut) {
    //     if (err) {
    //         console.error(err)
    //     }
    //     log(stdOut)
    // })
    // wmic.execute('computersystem get systemtype', function (err, stdOut) {
    //     if (err) {
    //         console.error(err)
    //     }
    //     log(stdOut)
    // })
    // wmic.execute('computersystem get model', function (err, stdOut) {
    //     if (err) {
    //         console.error(err)
    //     }
    //     log(stdOut)
    // })
    // wmic.execute('Path Win32_Battery Get BatteryStatus /Format:List', function (err, stdOut) {
    //     if (err) {
    //         console.error(err)
    //     }
    //     log(stdOut)
    // })

}

function getComputerModel() {
    if (config.IS_WINDOWS) {
        return getComputerModelWindows()
    } else if (config.IS_LINUX) {

    } else if (config.IS_OSX) {

    }
}