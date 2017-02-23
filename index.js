/**
 * index.js - tnl
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const Port = require('serialport')
    , tty = require('tty')
    , log = require('util').debuglog('tnl')
    , { SERVER_PORT } = require('./config')

;(async function () {
  const SERVER_HOST = await require('./lib/find')()
      , sock = await require('./lib/connect')(SERVER_HOST, SERVER_PORT)

  let port = await require('./lib/port')()

  // first packet of data should be considered configuration
  sock.once('data', config => {
    try {
      port = new Port(port, JSON.parse(config))
      
      // tty-ify the socket
      sock.isTTY = true
      sock.getWindowSize = () => {
        let { rows, cols } = process.stdout
        return [rows, cols]
      }
      sock.cursorTo = tty.WriteStream.prototype.cursorTo
      sock.clearLine = tty.WriteStream.prototype.clearLine
      sock.moveCursor = tty.WriteStream.prototype.moveCursor
      sock._emitKey = tty.ReadStream.prototype._emitKey
      sock.on('data', b => sock._emitKey(b))

      // pipe from socket to the serial port
      sock.on('data', d => {
        log('Got data: (%j)', d)
        port.write(d)
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