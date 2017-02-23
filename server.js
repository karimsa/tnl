/**
 * server.js - tnl
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const fs = require('fs')
    , path = require('path')
    , tty = require('tty')
    , { SERVER_PORT } = require('./config')

/**
 * Create a secure server that accepts authentication
 * from a single client, authenticated by private key.
 */
const server = require('tls').createServer({
  key: fs.readFileSync(path.resolve(__dirname, 'ssl', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, 'ssl', 'server.crt')),

  requestCert: true,
  rejectUnauthorized: true,
  
  ca: [ fs.readFileSync(path.resolve(__dirname, 'ssl', 'client.key')) ]
}, sock => {
  console.log('Connected! Welcome.')
  server.close()

  /**
   * Setup socket to work as a tty.
   */
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

  /**
   * Setup stdin to work as a tty.
   */
  process.stdin.resume()
  process.stdin.setRawMode(true)
  process.stdin.on('data', s => {
    if (s[0] === 0x03) {
      sock.close()
      process.exit(0)
    } else {
      sock.write(s)
    }
  })

  /**
   * Stream socket output back.
   */
  process.stdout.setEncoding('utf8')
  sock.pipe(process.stdout)
})

server.on('error', err => console.error('! %s', err))
server.listen(SERVER_PORT, () => console.log('* Awaiting connection on :%s ...', SERVER_PORT))