'use strict'

const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

const storage = require('electron-json-storage')
const Firebase = require("firebase")
const Peer = require("peerjs")

const getEnergyInfo = remote.require('../lib/energy-profiler')
const powerToggle = remote.require('../lib/power-control')

const devicesRef = new Firebase("https://tum-demand-response.firebaseio.com/devices")
const energyInfoRef = new Firebase("https://tum-demand-response.firebaseio.com/energy")
const commandsRef = new Firebase("https://tum-demand-response.firebaseio.com/commands")


var peer = null
var devices = []
var machine_uuid = null
var newItems = false
var energyChange = false
var leader = false

storage.get('machine-uuid', (error, data)=> {
    machine_uuid = data.uuid
    devicesRef.child(machine_uuid).set({
        crate_time: Firebase.ServerValue.TIMESTAMP,
        leader: false
    })
    peer = new Peer(machine_uuid, {key: '7ggovlbqk82jfw29'})
    peer.on('connection', (connection)=> {
        ipc.send('notification-show', 'got connection from <br>' + connection.peer)
        handleConnections(connection)
    })
})

devicesRef.on("child_added", (snapshot, prevChildKey) => {

    if (!newItems) return
    if (devices.length == 0) {
        leader = true
        devicesRef.child(machine_uuid).update({
            leader: true
        })
    }
    if (machine_uuid != snapshot.key()) {
        var tempConnection = peer.connect(snapshot.key())
        ipc.send('notification-show', 'connected to <br>' + snapshot.key())
        handleConnections(tempConnection)
    }
    console.log(leader)
})

devicesRef.once('value', (messages) => {
    newItems = true
})

var handleConnections = (connection) => {
    connection.on('open', () => {
        connection.on('data', (data) => {
            receivedData(connection, data)
        })
    })
    devices.push(connection)
}

var receivedData = (connection, data) => {
    ipc.send('notification-show', 'got data from peer: <br>' + JSON.stringify(data))
    // Do aggregation Here
    // use other patterns
    if ("command" in data) {
        powerToggle()
        ipc.send('notification-show', 'Toggle energy mode from Peer')
    }
    else if ("battery" in data) {
        if (leader) {
            energyInfoRef.child(require('node-uuid').v4()).set({
                crate_time: Firebase.ServerValue.TIMESTAMP,
                battery: data.battery
            })
        }
    }

}

var sendData = (connection, data)=> {
    connection.send(data)
    ipc.send('notification-show', 'sent data to peers: <br>' + JSON.stringify(data))
}


// Fore demo
setInterval(()=> {
    if (!leader) {
        for (let i = 0; i < devices.length; i++) {
            sendData(devices[i], getEnergyInfo())
        }
    }
}, 15000)

commandsRef.on("value", (snapshot) => {
    if (!energyChange) {
        energyChange = true
        return
    }
    powerToggle()
    if (leader) {
        for (let i = 0; i < devices.length; i++
        ) {
            sendData(devices[i], {'command': 'change-power'})
        }
    }
})
