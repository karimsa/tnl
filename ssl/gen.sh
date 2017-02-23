#!/bin/bash

MOD=8192

# generate private key
openssl genrsa -out server.key $MOD

# generate signing request
openssl req -new -sha256 -key server.key -out server.csr

# remove passphrase from key
mv server.key server.key.org
openssl rsa -in server.key.org -out server.key

# generate certificate
openssl x509 -req -in server.csr -signkey server.key -out server.crt

##################################

# generate private key
openssl genrsa -out client.key $MOD

# remove passphrase from key
mv client.key client.key.org
openssl rsa -in client.key.org -out client.key