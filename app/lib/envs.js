'use strict'

module.exports = init

const config = require('../config')

function init() {
    process.env.GOOGLE_API_KEY = config.GOOGLE_API_KEY
}

