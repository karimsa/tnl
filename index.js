/**
 * index.js - tnl
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const net = require('net')
    , Port = require('serialport')
    , { SERVER_PORT } = require('./config')

;(async function () {
  const SERVER_HOST = await require('./lib/find')()
      , sock = await require('./lib/connect')(SERVER_HOST, SERVER_PORT)
      , port = await require('./lib/port')()
  
  // first packet of data should be considered configuration
  sock.once('data', config => {
    try {
      port = new Port(port, JSON.parse(config))

      process.stdin.resume()
      process.stdin.setRaw(true)
      process.stdin.on('data', s => {
        if (s[0] === 0x03) {
          port.close()
          process.exit(0)
        } else {
          port.write(s)
        }
      })

      port.on('data', (data) => sock.write(data.toString()))
      port.on('error', (err) => {
        console.error(err)
        process.exit(-1)
      })
    } catch (err) {
      console.error(err)
    }
  })
}()).then(() => 0, console.log)