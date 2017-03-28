'use strict'

const crashReporter = require('../../lib/crash-reporter')
crashReporter.init({'scope': 'geolocation'})

const {ipcRenderer, remote} = require('electron')

const async = require('async')
const request = require('request')

const config = require('../../config')
const firebase = remote.require('./lib/firebase')
const log = remote.require('./lib/log')
const db = remote.require('./main/windows').db

let freegeoipLocation = null
let navigatorLocation = null
let googleMapLocation = null

function freegeoipLocationFinder(cb) {
    freegeoipLocation = null
    request(config.FREEGEOIP_URL, (err, res, data) => {
            if (err) {
                log.sendError(err)
            }
            else if (res.statusCode === 200) {
                freegeoipLocation = JSON.parse(data)
            } else {
                log.sendError({'message': `FreeGeoIP Unexpected status code: ${res.statusCode}`})
            }
            cb(null)
        }
    )
}

function navigatorLocationFinder(cb) {
    navigatorLocation = null
    let options = {
        enableHighAccuracy: true,
        timeout: 27000,
        maximumAge: 30000
    }
    navigator.geolocation.getCurrentPosition((position) => {
        navigatorLocation = position
        cb(null)
    }, (err) => {
        log.sendError(err)
        cb(null)
    }, options)
}

function googleMapLocationFinder(cb) {
    googleMapLocation = null
    request.post(config.GOOGLE_GEOLOCATION, (err, res, data) => {
            if (err) {
                log.sendError(err)
            }
            else if (res.statusCode === 200) {
                googleMapLocation = JSON.parse(data)
            } else {
                log.sendError({'message': `Google Maps Unexpected status code: ${res.statusCode}`})
            }
            cb(null)
        }
    )
}

function aggregateLocations(err) {
    let locationData = {
        'latitude': '',
        'longitude': '',
        'ip': '',
        'country-code': '',
        'country-name': '',
        'region-code': '',
        'region-name': '',
        'city': '',
        'zip-code': '',
        'time-zone': '',
        'accuracy': ''
    }

    if (navigatorLocation && navigatorLocation.coords) {
        locationData['latitude'] = navigatorLocation.coords.latitude
        locationData['longitude'] = navigatorLocation.coords.longitude
        locationData['accuracy'] = navigatorLocation.coords.accuracy
    }
    /* jshint ignore:start */
    if (googleMapLocation) {
        if (navigatorLocation && navigatorLocation.coords) {
            if (parseFloat(googleMapLocation['accuracy']) < navigatorLocation.coords.accuracy) {
                locationData['latitude'] = googleMapLocation['latitude']
                locationData['longitude'] = googleMapLocation['longitude']
                locationData['accuracy'] = googleMapLocation['accuracy']
            }
        }
        else {
            locationData['latitude'] = googleMapLocation['location']['lat']
            locationData['longitude'] = googleMapLocation['location']['lng']
            locationData['accuracy'] = googleMapLocation['accuracy']
        }
    }

    /* jshint ignore:end */

    if (freegeoipLocation) {
        locationData['ip'] = freegeoipLocation['ip']
        locationData['country-code'] = freegeoipLocation['country_code']
        locationData['country-name'] = freegeoipLocation['country_name']
        locationData['region-code'] = freegeoipLocation['region_code']
        locationData['region-name'] = freegeoipLocation['region_name']
        locationData['city'] = freegeoipLocation['city']
        locationData['zip-code'] = freegeoipLocation['zip_code']
        locationData['time-zone'] = freegeoipLocation['time_zone']
        if (!locationData['latitude']) {
            locationData['latitude'] = freegeoipLocation['latitude']
        }
        if (!locationData['longitude']) {
            locationData['longitude'] = freegeoipLocation['longitude']
        }
    }
    return locationData

}

function findLocation() {
    let locationData = aggregateLocations()
    if (locationData['latitude'] && locationData['longitude']) {
        db.runQuery({
            'fn': 'addLocation',
            'params': locationData
        })
    }
    window.close()
}

function makeLocationProfile() {
    let locationData = aggregateLocations()
    if (locationData['latitude'] && locationData['longitude']) {
        db.runQuery({
            'fn': 'addLocationFirstProfile',
            'params': locationData
        })
    }
    window.close()
}

ipcRenderer.on('find-location', (event, msg) => {
    async.parallel([
        freegeoipLocationFinder,
        navigatorLocationFinder,
        googleMapLocationFinder
    ], findLocation)
})

ipcRenderer.on('make-location-profile', (event, msg) => {
    async.parallel([
        freegeoipLocationFinder,
        navigatorLocationFinder,
        googleMapLocationFinder
    ], makeLocationProfile)
})

window.onerror = function rendererErrorHandler(errorMsg, url, lineNumber) {
    log.sendError({'message': errorMsg, 'stack': url, 'lineNumber': lineNumber})
    return false;
}