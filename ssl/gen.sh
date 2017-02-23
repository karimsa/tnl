#!/bin/bash

# config
MOD=8192
CN=$( node -e 'console.log(require("../config.json").SERVER_HOST)' )

##################################

echo ""
echo "GENERATING SERVER CERTIFICATE PAIR"
echo ""

# generate private key
openssl genrsa -out server.key $MOD

# generate signing request
openssl req -new -sha256 -key server.key -out server.csr -subj "/CN=$CN"

# remove passphrase from key
mv server.key server.key.org
openssl rsa -in server.key.org -out server.key

# generate certificate
openssl x509 -req -in server.csr -signkey server.key -out server.crt

##################################

echo ""
echo "GENERATING CLIENT CERTIFICATE PAIR"
echo ""

# generate private key
openssl genrsa -out client.key $MOD

# generate signing request
openssl req -new -sha256 -key client.key -out client.csr -subj "/CN=$CN"

# remove passphrase from key
mv client.key client.key.org
openssl rsa -in client.key.org -out client.key

# generate certificate
openssl x509 -req -in client.csr -signkey client.key -out client.crt