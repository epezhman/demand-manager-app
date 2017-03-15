'use strict'

const appConfig = require('application-config')('i13DMDesktop')
const fs = require('fs')
const path = require('path')

const appPackage = require('./package.json')
const APP_SHORT_NAME = appPackage.name
const APP_NAME = appPackage.productName
const APP_TEAM = appPackage.author.name
const APP_VERSION = appPackage.version
const APP_HOMEPAGE = appPackage.homepage
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const IS_WINDOWS = process.platform === 'win32'
const IS_LINUX = process.platform === 'linux'
const IS_OSX = process.platform === 'darwin'

module.exports = {
    APP_COPYRIGHT: 'Copyright © 2016 ' + APP_NAME,
    APP_SHORT_NAME: APP_SHORT_NAME,
    APP_NAME: APP_NAME,
    APP_TEAM: APP_TEAM,
    APP_VERSION: APP_VERSION,
    APP_HOMEPAGE: APP_HOMEPAGE,
    IS_WINDOWS: IS_WINDOWS,
    IS_LINUX: IS_LINUX,
    IS_OSX: IS_OSX,
    AUTO_UPDATE_WIN_BASE_URL: 'https://s3.eu-central-1.amazonaws.com/demand-manager-resources/updates/latest/win',
    AUTO_UPDATE_LINUX_BASE_URL: 'http://131.159.52.146/update_server/updates/latest/linux',
    AUTO_UPDATE_OSX_BASE_URL: 'http://131.159.52.146/update_server/updates/latest/osx',
    AUTO_UPDATE_CHECK_INTERVAL: 43200000,
    AUTO_LAUNCH_LINUX_COMMAND: '/opt/i13\\ Demand\\ Manager/i13\\ Demand\\ Manager',
    CRASH_REPORT_URL: 'http://131.159.52.146/crash_report/post',
    CONFIG_PATH: getConfigPath(),
    GITHUB_URL: 'https://github.com/epezhman/demand-manager-app',
    GITHUB_URL_ISSUES: 'https://github.com/epezhman/demand-manager-app/issues',
    ROOT_PATH: __dirname,
    BASE_ASSETS_IMG: path.resolve(__dirname, 'assets', 'img') + '/',
    APP_ICON: path.join(__dirname, 'assets', 'img', 'icon.png'),
    APP_ICON_MENU: path.join(__dirname, 'assets', 'img', 'icon-menu.png'),
    WINDOW_MAIN: 'file://' + path.join(__dirname, 'renderer', 'main.html'),
    WINDOW_NOTIFY: 'file://' + path.join(__dirname, 'renderer', 'lib', 'notify.html'),
    WINDOW_GEOLOCATION: 'file://' + path.join(__dirname, 'renderer', 'lib', 'geolocation.html'),
    WINDOW_DB: 'file://' + path.join(__dirname, 'renderer', 'lib', 'db.html'),
    WINDOW_REGISTER: path.join(__dirname, 'renderer', 'lib', 'register.html'),
    APP_WINDOW_TITLE: APP_NAME,
    WINDOW_MIN_HEIGHT: 400,
    WINDOW_MIN_WIDTH: 800,
    FIREBASE_DATABASE_URL: 'https://tum-dm-fireb.firebaseio.com',
    FIREBASE_API_KEY: 'AIzaSyAtWT98dejyLr9BQXkmxiTHbBtbKQ1ObnY',
    FIREBASE_AUTH_DOMAIN: 'tum-dm-fireb.firebaseapp.com',

    FIREBASE_TEST_DATABASE_URL: 'https://dm-test-data.firebaseio.com',
    FIREBASE_TEST_API_KEY: 'AIzaSyBUurlevQCRuK5n62-MBhjCeIFWm97gYIM',
    FIREBASE_TEST_AUTH_DOMAIN: 'dm-test-data.firebaseapp.com',

    IS_DEVELOPMENT: IS_DEVELOPMENT,

    DELAY_START_TIME: 10000,
    DELAY_START_TIME_FIRST_TIME: 10000,
    MONITOR_GEOLOCATION_INTERVAL: 900000,
    RUN_DM_INTERVAL_CHECK: 65000,
    MONITOR_POWER_INTERVAL: 1000,
    MONITOR_RUNNING_PROFILE_INTERVAL: 900000,
    ADD_RUNNING_PROFILE_INTERVAL: 3600000,
    UPDATE_POWER_STATS_DAILY: 86400000,

    MONITOR_IDLE: 10000,
    MONITOR_IDLE_TIMEOUT: 60000,
    MONITOR_IDLE_TIMEOUT_SUSPEND: 300000,

    FREEGEOIP_URL: 'http://131.159.52.146/freegeoip/json/',
    GOOGLE_GEOLOCATION: 'https://www.googleapis.com/geolocation/v1/' +
    'geolocate?key=AIzaSyCnrXBo3KQiqcLOGWxzPMrrZ3EIFlObow8',
    GOOGLE_API_KEY: 'AIzaSyDmvKy8vA3OjWV4nV-mmRPh5_uXQM4-zKA',
    LOVEFIELD_DB_NAME: 'dmtum',
    LOVEFIELD_DB_VERSION: 36
}

function getConfigPath() {
    return path.dirname(appConfig.filePath)
}