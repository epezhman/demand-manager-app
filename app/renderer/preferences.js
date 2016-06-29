'use strict'

const crashReporter = remote.require('../lib/crash-reporter')
crashReporter.init({'scope': 'preferences'})

const remote = require('electron').remote

const storage = require('electron-json-storage')
const AutoLaunch = require('auto-launch')
const config = remote.require('../config')
const log = remote.require('../lib/log')


var runStartUpCheckBox
var timeLimitUpCheckBox
var timeLimitStart
var timeLimitUpEnd
var timeValidatorError

var appLauncher = new AutoLaunch({
    name: config.APP_NAME
})

function enableAutoStart() {
    log('enabling auto start')
    appLauncher.isEnabled().then((enabled) => {
        if (enabled) return
        return appLauncher.enable()
    }).then((enabled) => {
        storage.set('run-on-start-up', {run: true}, (error)=> {
        })
    })
}

function disableAutoStart() {
    log('disabling auto start')
    appLauncher.isEnabled().then((enabled)=> {
        if (enabled) {
            return appLauncher.disable()
        }
    }).then((disabled)=> {
        storage.set('run-on-start-up', {run: false}, (error) => {
        })
    })
}

function checkIfAutoStartRunning() {
    log('checking if auto start running')
    storage.get('run-on-start-up', (error, data) => {
        if (data.run)
            runStartUpCheckBox.prop('checked', true)
    })
}

function enableLimitedActivity() {
    log('enabling limited activity')
    storage.remove('limited-activity', (error) => {
    })
    storage.remove('limited-activity-start-time', (error)=> {
        timeLimitStart.val(0)
        timeLimitStart.prop('disabled', true)
    })
    storage.remove('limited-activity-end-time', (error)=> {
        timeLimitUpEnd.val(24)
        timeLimitUpEnd.prop('disabled', true)
    })
}

function disableLimitedActivity() {
    log('disabling limited activity')
    storage.set('limited-activity', {limited: true}, (error) => {
        timeLimitStart.prop('disabled', false)
        timeLimitUpEnd.prop('disabled', false)
    })
}

function checkIfLimitedActivitySet() {
    log('checking if limited activity is set')
    storage.has('limited-activity', (error, hasKey)=> {
        if (!hasKey) {
            timeLimitUpCheckBox.prop('checked', true)
        }
        else {
            timeLimitStart.prop('disabled', false)
            timeLimitUpEnd.prop('disabled', false)
        }
    })
    storage.has('limited-activity-start-time', (error, hasKey)=> {
        if (hasKey) {
            storage.get('limited-activity-start-time', (error, data) => {
                if (data.limited_start_time)
                    timeLimitStart.val(data.limited_start_time)
            })
        }
    })

    storage.has('limited-activity-end-time', (error, hasKey)=> {
        if (hasKey) {
            storage.get('limited-activity-end-time', (error, data)=> {
                if (data.limited_end_time)
                    timeLimitUpEnd.val(data.limited_end_time)
            })
        }
    })
}

function checkEndTimeValidation() {
    var start_time = timeLimitStart.val()
    var end_time = timeLimitUpEnd.val()
    if (parseInt(start_time) >= parseInt(end_time)) {
        timeValidatorError.show()
        return false
    }
    timeValidatorError.hide()
    return true
}


$(document).ready(function () {

    runStartUpCheckBox = $('#run-at-start-up')
    timeLimitUpCheckBox = $('#limited-activity')
    timeLimitStart = $('#limited-activity-start-time')
    timeLimitUpEnd = $('#limited-activity-end-time')
    timeValidatorError = $('#end-time-error')

    checkIfAutoStartRunning()
    checkIfLimitedActivitySet()

    runStartUpCheckBox.click(()=> {
        process.crash()
        log('rash')
        if (runStartUpCheckBox.prop('checked')) {
            enableAutoStart()
        }
        else {
            disableAutoStart()
        }
    })

    timeLimitUpCheckBox.click(()=> {
        if (timeLimitUpCheckBox.prop('checked')) {
            enableLimitedActivity()
        }
        else {
            disableLimitedActivity()
        }
    })

    timeLimitStart.change(()=> {
        if (checkEndTimeValidation())
            storage.set('limited-activity-start-time', {
                limited_start_time: timeLimitStart.val()
            }, (error) => {
            })
    })

    timeLimitUpEnd.change(()=> {
        if (checkEndTimeValidation())
            storage.set('limited-activity-end-time', {
                limited_end_time: timeLimitUpEnd.val()
            }, (error)=> {
            })

    })
})