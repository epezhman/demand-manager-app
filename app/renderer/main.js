'use strict'

const crashReporter = require('../lib/crash-reporter')
crashReporter.init({'scope': 'preferences'})

const {ipcRenderer, remote} = require('electron')
const ConfigStore = require('configstore')
const AutoLaunch = require('auto-launch')
const config = require('../config')
const log = require('../lib/log')
const enums = require('../lib/enums')
const monitor = remote.require('./lib/monitor')

const conf = new ConfigStore(config.APP_SHORT_NAME)

var runStartUpCheckBox
var timeLimitUpCheckBox
var timeLimitStart
var timeLimitUpEnd
var timeValidatorError
var navItems
var navPanes
var statusNavItem
var settingsNavItem
var aboutNavItem
var appRunning
var appPaused

var selectedTab = null
var ipcReady = false

var appLauncher = new AutoLaunch({
    name: config.APP_NAME,
    isHidden: true
})

ipcRenderer.on('selected-window', (event, windowType)=> {
    selectedTab = windowType
    if(ipcReady)
    {
        checkIfShouldSelectTab()
    }
})

function selectTab(tabToSelect) {
    navItems.removeClass('active')
    tabToSelect.addClass('active')
    navPanes.hide()
    $(`#${tabToSelect.data('manager-pane-id')}`).show()
}

function enableAutoStart() {
    appLauncher.isEnabled().then((enabled) => {
        if (enabled) {
            return
        }
        return appLauncher.enable()
    }).then((enabled) => {
        conf.set('run-on-start-up', true)
    })
}

function disableAutoStart() {
    appLauncher.isEnabled().then((enabled)=> {
        if (enabled) {
            return appLauncher.disable()
        }
    }).then((disabled)=> {
        conf.set('run-on-start-up', false)
    })
}

function checkIfAutoStartRunning() {
    if (conf.get('run-on-start-up')) {
        runStartUpCheckBox.prop('checked', true)
    }
}

function enableLimitedActivity() {
    conf.del('limited-activity')
    conf.del('limited-activity-start-time')
    conf.del('limited-activity-end-time')
    timeLimitStart.val(0)
    timeLimitStart.prop('disabled', true)
    timeLimitUpEnd.val(24)
    timeLimitUpEnd.prop('disabled', true)
    checkIfAppRunning()
}

function disableLimitedActivity() {
    conf.set('limited-activity', true)
    conf.set('limited-activity-start-time', 0)
    conf.set('limited-activity-end-time', 24)
    timeLimitStart.prop('disabled', false)
    timeLimitUpEnd.prop('disabled', false)
    checkIfAppRunning()
}

function checkIfLimitedActivitySet() {
    if (conf.get('limited-activity')) {
        timeLimitStart.prop('disabled', false)
        timeLimitUpEnd.prop('disabled', false)
    }
    else {
        timeLimitUpCheckBox.prop('checked', true)
    }

    var startTime = conf.get('limited-activity-start-time')
    if (startTime !== undefined) {
        timeLimitStart.val(startTime)
    }

    var endTime = conf.get('limited-activity-end-time')
    if (endTime !== undefined) {
        timeLimitUpEnd.val(endTime)
    }
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

function checkIfAppRunning() {
    if (monitor.shouldAppBeRunning()) {
        appPaused.hide()
        appRunning.show()
    }
    else {
        appPaused.show()
        appRunning.hide()
    }
}

function checkIfShouldSelectTab() {
    if (selectedTab === enums.WindowType.ABOUT) {
        selectTab(aboutNavItem)
    }
    else if (selectedTab === enums.WindowType.SETTINGS) {
        selectTab(settingsNavItem)
    }
    else if (selectedTab === enums.WindowType.STATUS) {
        selectTab(statusNavItem)
    }
    selectedTab = null
}

$(document).ready(()=> {

    runStartUpCheckBox = $('#run-at-start-up')
    timeLimitUpCheckBox = $('#limited-activity')
    timeLimitStart = $('#limited-activity-start-time')
    timeLimitUpEnd = $('#limited-activity-end-time')
    timeValidatorError = $('#end-time-error')
    navItems = $('.nav-group-item')
    navPanes = $('.manager-pane')
    statusNavItem = $('#status-menu-item')
    settingsNavItem = $('#settings-menu-item')
    aboutNavItem = $('#about-menu-item')
    appPaused = $('#app-paused-message')
    appRunning = $('#app-running-message')

    ipcReady = true

    checkIfAutoStartRunning()
    checkIfLimitedActivitySet()
    checkIfAppRunning()
    checkIfShouldSelectTab()

    navItems.click((e)=> {
        selectTab($(e.target))
    })

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
        checkEndTimeValidation()
    })

    timeLimitStart.change(()=> {
        if (checkEndTimeValidation()) {
            conf.set('limited-activity-start-time', timeLimitStart.val())
            checkIfAppRunning()
        }
    })

    timeLimitUpEnd.change(()=> {
        if (checkEndTimeValidation()) {
            conf.set('limited-activity-end-time', timeLimitUpEnd.val())
            checkIfAppRunning()
        }
    })
})