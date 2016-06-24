'use strict'

const appConfig = require('application-config')('TUMDMDesktop')
const fs = require('fs')
const path = require('path')

const appPackage = require('./package.json')
const APP_NAME = appPackage.productName
const APP_TEAM = appPackage.author.name
const APP_VERSION = appPackage.version

module.exports = {

    APP_COPYRIGHT: 'Copyright © 2016 ' + APP_NAME,

    APP_NAME: APP_NAME,
    APP_TEAM: APP_TEAM,
    APP_VERSION: APP_VERSION,

    AUTO_UPDATE_WIN_BASE_URL: 'https://s3.eu-central-1.amazonaws.com/demand-manager-resources/updates/latest/win',
    AUTO_UPDATE_LINUX_BASE_URL: 'http://188.166.160.83/update_server/updates/latest/linux',
    AUTO_UPDATE_OSX_BASE_URL: 'http://188.166.160.83/update_server/updates/latest/osx',

    CRASH_REPORT_URL: '',

    CONFIG_PATH: getConfigPath(),
    
    GITHUB_URL: 'https://github.com/epezhman/demand-manager-app',
    GITHUB_URL_ISSUES: 'https://github.com/epezhman/demand-manager-app/issues',



    HOME_PAGE_URL: '',

    ROOT_PATH: __dirname,

    WINDOW_INDEX: 'file://' + path.join(__dirname, 'renderer', 'index.html'),

    WINDOW_MIN_HEIGHT: 300,
    WINDOW_MIN_WIDTH: 400
}

function getConfigPath() {
    return path.dirname(appConfig.filePath)
}
