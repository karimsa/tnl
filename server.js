/**
 * server.js - tnl
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const fs = require('fs')
    , path = require('path')
    , tty = require('tty')
    , emoji = require('node-emoji')
    , { SERVER_PORT, BAUD_RATE, DATA_BITS, PARITY, STOP_BITS } = require('./config')

/**
 * Loading animation.
 */
let isConnected = false
let index = -1
const ns = n => { return [... new Array(n)].map(_ => ' ').join('') }
const animate = () => {
  index ++
  if (index === 3) index = 0

  process.stdout.write('\rWaiting for connection ... ' + emoji.get('desktop_computer') + '  ' + ns(index) + emoji.get('yin_yang') + ns(2 - index) + '  ' + emoji.get('desktop_computer'))
  if (!isConnected) setTimeout(animate, 250)
}

/**
 * Create a secure server that accepts authentication
 * from a single client, authenticated by private key.
 */
const server = require('tls').createServer({
  key: fs.readFileSync(path.resolve(__dirname, 'ssl', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, 'ssl', 'server.crt')),

  requestCert: true,
  rejectUnauthorized: true,

  ca: [ fs.readFileSync(path.resolve(__dirname, 'ssl', 'client.crt')) ]
}, sock => {
  console.log('\nConnected! Welcome.')
  isConnected = true
  server.close()

  /**
   * Event handling.
   */
  sock.on('close', () => {
    console.log('Connection closed.')
    process.exit(-1)
  })
  sock.on('error', err => {
    console.error('! %s', err)
    process.exit(-1)
  })

  /**
   * Send config.
   */
  sock.write(new Buffer(JSON.stringify({
    baudRate: BAUD_RATE,
    dataBits: DATA_BITS,
    parity: PARITY,
    stopBits: STOP_BITS
  }), 'utf8'))

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
server.listen(SERVER_PORT, animate)