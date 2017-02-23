/**
 * lib/port.js - tnl
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const Port = require('serialport')
    , { DEV_VID, DEV_PID } = require('../config')

/**
 * Lookup the correct port path.
 */
const getPort = () => new Promise((resolve, reject) =>
  Port.list((err, ports) => {
    if (err) return reject(err)

    const port = ports.filter(port => (
      port.vendorId === DEV_VID && port.productId === DEV_PID
    ))[0]

    if (port) resolve(port.comName)
    else reject(new Error('No such device.'))
  })
)

/**
 * Wait for port, then open it up.
 */
module.exports = () => new Promise((resolve, reject) => {
  const next = function () {
    getPort().then(port => {
      console.log('Found port at %s', port)
      resolve(port)
    }, err => {
      console.log('%s %s', emoji.get('interrobang'), err)
      setTimeout(next, 1000)
    })
  }

  console.log('Looking for serial device ...')
  next()
})