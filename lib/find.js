/**
 * lib/find.js - tnl
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const dns = require('dns')
    , { SERVER_HOST } = require('../config')

/**
 * Let's use Google's DNS servers instead of the
 * local ones to avoid caching issues.
 */
dns.setServers([ '8.8.8.8', '8.8.4.4' ])

/**
 * Search that succeeds with the IP address
 * behind 'SERVER_HOST'
 */
const search = () => new Promise((resolve, reject) =>
  dns.resolve4(SERVER_HOST, (err, address) => {
    if (err) reject (err)
    else {
      console.log('Resolved host to %s', SERVER_HOST)
      resolve(address[0])
    }
  })
)

/**
 * Promise that resolves on the first success of
 * the search.
 */
module.exports = () => new Promise((resolve, reject) => {
  const next = function () {
    search().then(resolve, err => {
      console.log('%s %s', emoji.get('interrobang'), err)
      setTimeout(next, 1000)
    })
  }

  next()
})