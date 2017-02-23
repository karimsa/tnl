/**
 * lib/connect.js - tnl
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const net = require('tls')
    , fs = require('fs')
    , path = require('path')

/**
 * Connects over to the given IP.
 */
const connect = (host, port) => new Promise((resolve, reject) => {
  console.log('Connecting ...')
  const sock = net.connect(port, host, {
    key: fs.readFileSync(path.resolve(__dirname, '..', 'ssl', 'client.key')),
    cert: fs.readFileSync(path.resolve(__dirname, '..', 'ssl', 'client.crt')),
    ca: [ fs.readFileSync(path.resolve(__dirname, '..', 'ssl', 'server.key')) ]
  }, () => {
    console.log('Connected.')
    resolve(sock)
  })
  
  sock.on('error', reject)
})

/**
 * Tries to connect until successful connection.
 */
module.exports = (host, port) => new Promise((resolve, reject) => {
  const next = function () {
    connect(host, port).then(resolve, err => {
      console.log('! %s', err)
      setTimeout(next, 1000)
    })
  }

  next()
})