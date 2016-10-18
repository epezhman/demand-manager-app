'use strict'

module.exports = getOSInfo

const os = require('os')

function getOSInfo() {
    return {
        'os-platform': os.platform(),
        'os-release': os.release(),
        'os-arch': os.arch(),
        'os-cpus': os.cpus(),
        'os-loadavg': os.loadavg(),
        'os-network-interfaces': os.networkInterfaces(),
        'os-totalmem': os.totalmem()
    }
}
