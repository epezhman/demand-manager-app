'use strict'

module.exports = powerToggle

const ConfigStore = require('configstore')

const config = require('../config')

const conf = new ConfigStore(config.APP_SHORT_NAME)


function powerToggle() {
    if (!conf.get('power-save-on')) {
        if (config.IS_WINDOWS) {
        }
        else if (config.IS_LINUX) {
            require('./linux-power-control').startDM()
        }
        conf.set('power-save-on', true)
    }
    else {
        if (config.IS_WINDOWS) {
        }
        else if (config.IS_LINUX) {
            require('./linux-power-control').stopDM()
        }
        conf.set('power-save-on', false)
    }
}


function powerToggleDeparted() {
    var exec = require('child_process').exec
    if (process.platform === 'win32') {
        exec('powercfg.exe -getactivescheme').stdout.on('data', function (data) {
            if (data.indexOf('GUID') > -1) {
                if (data.indexOf('a1841308-3541-4fab-bc81-f71556f20b4a') > -1) {
                    exec('powercfg.exe -setactive 381b4222-f694-41f0-9685-ff5bb260df2e')
                }
                else {
                    exec('powercfg.exe -setactive a1841308-3541-4fab-bc81-f71556f20b4a')
                }
            }
        })
    }
    else if (process.platform === 'linux') {
        exec('xrandr -q | grep " connected"').stdout.on('data', function (data) {
            if (data.indexOf('connected') > -1) {
                var screen = data.substring(0, data.indexOf('connected'))
                exec('xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d " "')
                    .stdout.on('data', function (brightness) {
                    if (brightness.indexOf('1.0') > -1) {
                        exec('xrandr --output ' + screen + ' --brightness 0.5')
                    }
                    else {
                        exec('xrandr --output ' + screen + ' --brightness 1')
                    }
                })
            }
        })
    }

}
