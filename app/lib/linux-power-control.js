'use strict'

module.exports = {
    startDM,
    stopDM,
    restoreBacklight
}

const log = require('./log')
const exec = require('child_process').exec
const ConfigStore = require('configstore')
const config = require('../config')
const notify = require('./notify')
const conf = new ConfigStore(config.APP_SHORT_NAME)
const idle = require('@paulcbetts/system-idle-time')
const monitor = require('./monitor')

let monitorIdleInterval = null

function toggleDimScreen(dimOn) {
    exec('xrandr -q | grep " connected"').stdout.on('data', (screensData) => {
        if (screensData && screensData.indexOf('connected') > -1) {
            let screens = screensData.split('\n')
            screens.forEach((screenLine) => {
                if (screenLine && screenLine.length) {
                    let screen = screenLine.substring(0, screenLine.indexOf('connected'))
                    if (dimOn) {
                        exec('xrandr --output ' + screen + ' --brightness 0.75')
                    }
                    else {
                        exec('xrandr --output ' + screen + ' --brightness 1')
                    }
                }
            })
        }
    })
}

function suspendComputer() {
    exec('systemctl suspend')
    exec('dbus-send --system --print-reply --dest="org.freedesktop.login1" ' +
        '/org/freedesktop/login1 org.freedesktop.login1.Manager.Suspend boolean:true')
    exec('dbus-send --system --print-reply --dest="org.freedesktop.UPower" ' +
        '/org/freedesktop/UPower org.freedesktop.UPower.Suspend')
}

function turnScreenOff() {
    exec('sleep 3; xset dpms force off')
}

function monitorIdle() {
    if (conf.get('turn-off-screen') || conf.get('suspend-computer')) {
        if (idle.getIdleTime() >= config.MONITOR_IDLE_TIMEOUT) {
            if (conf.get('suspend-computer')
                && idle.getIdleTime() >= config.MONITOR_IDLE_TIMEOUT_SUSPEND) {
                suspendComputer()
            }
            else if (conf.get('turn-off-screen')) {
                turnScreenOff()
            }
        }
    }
}

function startDM() {
    conf.set('dm-already-stop', false)
    if (!conf.get('dm-already-start')) {
        conf.set('dm-already-start', true)
        conf.set('started-running', new Date())
        notify('Power save mode has started')
        if (conf.get('dim-screen')) {
            toggleDimScreen(true)
        }
        monitorIdleInterval = setInterval(monitorIdle, config.MONITOR_IDLE)
    }
}

function stopDM() {
    conf.set('dm-already-start', false)
    if (!conf.get('dm-already-stop')) {
        conf.set('dm-already-stop', true)
        monitor.calculateSavedMinutes()
        notify('Power save mode has ended')
        if (conf.get('dim-screen')) {
            toggleDimScreen(false)
        }
        if (monitorIdleInterval) {
            clearInterval(monitorIdleInterval)
        }
    }
}

function restoreBacklight() {
    toggleDimScreen(false)
}