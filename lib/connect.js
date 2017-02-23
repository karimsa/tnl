/**
 * lib/connect.js - tnl
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const net = require('tls')
    , fs = require('fs')
    , path = require('path')
    , { SERVER_HOST } = require('../config')

/**
 * Connects over to the given IP.
 */
const connect = (host, port) => new Promise((resolve, reject) => {
  let promiseResolved = false

  console.log('Connecting ...')
  const sock = net.connect(port, host, {
    key: fs.readFileSync(path.resolve(__dirname, '..', 'ssl', 'client.key')),
    cert: fs.readFileSync(path.resolve(__dirname, '..', 'ssl', 'client.crt')),
    ca: [ fs.readFileSync(path.resolve(__dirname, '..', 'ssl', 'server.crt')) ],
    servername: SERVER_HOST
  }, () => {
    console.log('Connected.')

    /**
     * Event handling.
     */
    sock.on('close', () => {
      console.log('Connection was closed.')
      process.exit(-1)
    })

    promiseResolved = true
    resolve(sock)
  })
  
  sock.on('error', err => {
    if (promiseResolved) {
      console.error('! %s', err)
      process.exit(-1)
    } else reject(err)
  })
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