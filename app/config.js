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

module.exports = {
    APP_COPYRIGHT: 'Copyright © 2017 ' + APP_NAME,
    APP_SHORT_NAME: APP_SHORT_NAME,
    APP_NAME: APP_NAME,
    APP_TEAM: APP_TEAM,
    APP_VERSION: APP_VERSION,
    APP_HOMEPAGE: APP_HOMEPAGE,
    IS_WINDOWS: IS_WINDOWS,
    IS_LINUX: IS_LINUX,
    AUTO_UPDATE_WIN_BASE_URL: 'https://s3.eu-central-1.amazonaws.com/demand-manager-resources/updates/latest/win',
    AUTO_UPDATE_LINUX_BASE_URL: 'http://update.i13dr.de/updates/latest/linux',
    AUTO_UPDATE_CHECK_INTERVAL: 43200000,
    AUTO_LAUNCH_LINUX_COMMAND: '/opt/i13DemandManager/i13dmdesktop',
    CRASH_REPORT_URL: 'http://crashreport.i13dr.de/post',
    EXCEPTION_REPORT_URL: 'http://www.admindata.i13dr.de/crashes/',
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

    DELAY_START_TIME: IS_DEVELOPMENT ? 10000 : 60000,
    DELAY_START_TIME_FIRST_TIME: IS_DEVELOPMENT ? 10000 : 10000,
    MONITOR_GEOLOCATION_INTERVAL: IS_DEVELOPMENT ? 900000 : 900000,
    RUN_DM_INTERVAL_CHECK: IS_DEVELOPMENT ? 65000 : 65000,
    MONITOR_POWER_INTERVAL: IS_DEVELOPMENT ? 1000 : 1000,
    MONITOR_RUNNING_PROFILE_INTERVAL: IS_DEVELOPMENT ? 900000 : 900000,
    ADD_RUNNING_PROFILE_INTERVAL: IS_DEVELOPMENT ? 3600000 : 3600000,
    UPDATE_POWER_STATS_DAILY: IS_DEVELOPMENT ? 86400000 : 86400000,

    MONITOR_IDLE: IS_DEVELOPMENT ? 10000 : 10000,
    MONITOR_IDLE_TIMEOUT: IS_DEVELOPMENT ? 60000 : 60000,
    MONITOR_IDLE_TIMEOUT_SUSPEND: IS_DEVELOPMENT ? 300000 : 300000,

    FREEGEOIP_URL: 'http://geoip.i13dr.de/json/',
    GOOGLE_GEOLOCATION: 'https://www.googleapis.com/geolocation/v1/' +
    'geolocate?key=AIzaSyCnrXBo3KQiqcLOGWxzPMrrZ3EIFlObow8',
    GOOGLE_API_KEY: 'AIzaSyDmvKy8vA3OjWV4nV-mmRPh5_uXQM4-zKA',
    LOVEFIELD_DB_NAME: 'dmtum',
    LOVEFIELD_DB_VERSION: 36
}

function getConfigPath() {
    return path.dirname(appConfig.filePath)
}