'use strict'

const remote = require('electron').remote
const crashReporter = require('../lib/crash-reporter')
crashReporter.init({'scope': 'preferences'})

const storage = require('electron-json-storage')
const AutoLaunch = require('auto-launch')
const config = remote.require('../config')
const log = remote.require('../lib/log')
const notify = remote.require('../lib/notify')

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
        if (enabled) {
            return
        }
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
        if (data.run) {
            runStartUpCheckBox.prop('checked', true)
        }
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
                if (data.limitedStartTime) {
                    timeLimitStart.val(data.limitedStartTime)
                }
            })
        }
    })

    storage.has('limited-activity-end-time', (error, hasKey)=> {
        if (hasKey) {
            storage.get('limited-activity-end-time', (error, data)=> {
                if (data.limitedEndTime) {
                    timeLimitUpEnd.val(data.limitedEndTime)
                }
            })
        }
    })
}

function checkEndTimeValidation() {
    var startTime = timeLimitStart.val()
    var endTime = timeLimitUpEnd.val()
    if (parseInt(startTime) >= parseInt(endTime)) {
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
        if (checkEndTimeValidation()) {
            storage.set('limited-activity-start-time', {
                limitedStartTime: timeLimitStart.val()
            }, (error) => {
            })
        }
    })

    timeLimitUpEnd.change(()=> {
        if (checkEndTimeValidation()) {
            storage.set('limited-activity-end-time', {
                limitedEndTime: timeLimitUpEnd.val()
            }, (error)=> {
            })
        }

    })
})