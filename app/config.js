'use strict'

const appConfig = require('application-config')('TUMDMDesktop')
const fs = require('fs')
const path = require('path')

const appPackage = require('./package.json')
const APP_NAME = appPackage.productName
const APP_TEAM = appPackage.author.name
const APP_VERSION = appPackage.version
const APP_HOMEPAGE = appPackage.homepage
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

module.exports = {
    APP_COPYRIGHT: 'Copyright © 2016 ' + APP_NAME,
    APP_NAME: APP_NAME,
    APP_TEAM: APP_TEAM,
    APP_VERSION: APP_VERSION,
    APP_HOMEPAGE: APP_HOMEPAGE,
    AUTO_UPDATE_WIN_BASE_URL: 'https://s3.eu-central-1.amazonaws.com/demand-manager-resources/updates/latest/win',
    AUTO_UPDATE_LINUX_BASE_URL: 'http://188.166.160.83/update_server/updates/latest/linux',
    AUTO_UPDATE_OSX_BASE_URL: 'http://188.166.160.83/update_server/updates/latest/osx',
    AUTO_UPDATE_CHECK_INTERVAL: 43200000,

    CRASH_REPORT_URL: 'http://188.166.160.83/crash_report/post',

    CONFIG_PATH: getConfigPath(),

    GITHUB_URL: 'https://github.com/epezhman/demand-manager-app',
    GITHUB_URL_ISSUES: 'https://github.com/epezhman/demand-manager-app/issues',

    ROOT_PATH: __dirname,
    BASE_ASSETS_IMG: path.resolve(__dirname, 'assets', 'img') + '/',
    APP_ICON: path.join(__dirname, 'assets', 'img', 'icon.png'),
    APP_ICON_MENU: path.join(__dirname, 'assets', 'img', 'icon-menu.png'),

    WINDOW_PREFERENCES: 'file://' + path.join(__dirname, 'renderer', 'preferences.html'),
    WINDOW_STATUS: 'file://' + path.join(__dirname, 'renderer', 'status.html'),
    WINDOW_ABOUT: 'file://' + path.join(__dirname, 'renderer', 'about.html'),
    WINDOW_NOTIFY: 'file://' + path.join(__dirname, 'renderer', 'lib', 'notify.html'),
    WINDOW_GEOLOCATION: 'file://' + path.join(__dirname, 'renderer', 'lib', 'geolocation.html'),

    APP_WINDOW_TITLE: APP_NAME,
    WINDOW_MIN_HEIGHT: 400,
    WINDOW_MIN_WIDTH: 800,

    FIREBASE_DATABASE_URL: 'https://tum-dm-fireb.firebaseio.com',
    FIREBASE_API_KEY: 'AIzaSyAtWT98dejyLr9BQXkmxiTHbBtbKQ1ObnY',
    IS_DEVELOPMENT: IS_DEVELOPMENT,
    DELAY_START_TIME: 3000,
    MONITOR_GEOLOCATION_INTERVAL: 3000,

    FREEGEOIP_URL: 'http://188.166.160.83/freegeoip/json/',
    GOOGLE_GEOLOCATION: 'https://maps.googleapis.com/maps/api/browserlocation/json?browser=chromium&sensor=true'

}

function getConfigPath() {
    return path.dirname(appConfig.filePath)
}
