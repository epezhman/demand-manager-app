'use strict'

const crashReporter = require('../../lib/crash-reporter')
crashReporter.init({'scope': 'geolocation'})

const {ipcRenderer, remote} = require('electron')

const async = require('async')
const request = require('request')

const config = require('../../config')
const firebase = remote.require('./lib/firebase')
const log = remote.require('./lib/log')

var freegeoipLocation = null
var navigatorLocation = null
var googleMapLocation = null

function freegeoipLocationFinder(cb) {
    freegeoipLocation = null
    request(config.FREEGEOIP_URL, (err, res, data) => {
            if (err) {
                log.error(`FreeGeoIP error: ${err.message}`)
            }
            else if (res.statusCode === 200) {
                freegeoipLocation = JSON.parse(data)
            } else {
                log.error(`FreeGeoIP Unexpected status code: ${res.statusCode}`)
            }
            cb(null)
        }
    )
}

function navigatorLocationFinder(cb) {
    navigatorLocation = null
    var options = {
        enableHighAccuracy: true,
        timeout: 27000,
        maximumAge: 30000
    }
    navigator.geolocation.getCurrentPosition((position)=> {
        navigatorLocation = position
        cb(null)
    }, (error)=> {
        log.error(`Navigator geolocation error: ${error.message}`)
        cb(null)
    }, options)
}

function googleMapLocationFinder(cb) {
    googleMapLocation = null
    request.post(config.GOOGLE_GEOLOCATION, (err, res, data) => {
            if (err) {
                log.error(`Google Maps error: ${err.message}`)
            }
            else if (res.statusCode === 200) {
                googleMapLocation = JSON.parse(data)
            } else {
                log.error(`Google Maps Unexpected status code: ${res.statusCode}`)
            }
            cb(null)
        }
    )
}

function aggregateLocations(err) {
    var locationData = {
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

    if (locationData['latitude'] && locationData['longitude']) {
        firebase.saveLocation(locationData)
    }
    window.close()
}

ipcRenderer.on('find-location', (event, msg)=> {
    async.parallel([
        freegeoipLocationFinder,
        navigatorLocationFinder,
        googleMapLocationFinder
    ], aggregateLocations)
})