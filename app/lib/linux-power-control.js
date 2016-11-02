'use strict'

module.exports = {
    startDM,
    stopDM
}

const log = require('./log')
var exec = require('child_process').exec
const ConfigStore = require('configstore')
const config = require('../config')

const conf = new ConfigStore(config.APP_SHORT_NAME)


function startDM() {
    conf.set('dm-already-stop', false)
    if (!conf.get('dm-already-start')) {
        exec('xrandr -q | grep " connected"').stdout.on('data', function (data) {
            if (data.indexOf('connected') > -1) {
                var screen = data.substring(0, data.indexOf('connected'))
                exec('xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d " "')
                    .stdout.on('data', function (brightness) {
                    exec('xrandr --output ' + screen + ' --brightness 0.7')
                    conf.set('dm-already-start', true)
                })
            }
        })
    }
}

function stopDM() {
    conf.set('dm-already-start', false)
    if (!conf.get('dm-already-stop')) {
        exec('xrandr -q | grep " connected"').stdout.on('data', function (data) {
            if (data.indexOf('connected') > -1) {
                var screen = data.substring(0, data.indexOf('connected'))
                exec('xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d " "')
                    .stdout.on('data', function (brightness) {
                    exec('xrandr --output ' + screen + ' --brightness 1')
                    conf.set('dm-already-stop', true)
                })
            }
        })
    }
}