var register = module.exports = {
    init,
    win: null
}

const electron = require('electron')
const http = require('http')
const fs = require('fs')

const config = require('../../config')
const log = require('../../lib/log')

// var isPortTaken = function (port, fn) {
//     var net = require('net')
//     var tester = net.createServer()
//         .once('error', function (err) {
//             if (err.code != 'EADDRINUSE') return fn(err)
//             fn(null, true)
//         })
//         .once('listening', function () {
//             tester.once('close', function () {
//                 fn(null, false)
//             })
//                 .close()
//         })
//         .listen(port)
// }


function init(provider) {

    if (register.win) {
        return
    }
    var win = register.win = new electron.BrowserWindow({
        icon: config.APP_ICON,
        title: config.APP_WINDOW_TITLE + ' - Register',
        show: true
    })

    win.loadURL('http://localhost:8080/pagee')

    win.webContents.openDevTools()

    win.setMenu(null)

    win.webContents.on('did-frame-finish-load', ()=> {
        win.webContents.send('register', provider)
    })
    win.once('closed', (e) => register.win = null)
}