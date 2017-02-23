# 🕳️ tnl

Reverse-tcp (over TLS) serial tunnel for remote serial administration.

 - [Client setup](#client-setup)
 - [Server setup](#server-setup)
 - [License](#license)

## Usage

The tunnel requires a reverse-tcp client and a server on a personal
network.

### Client setup

You'll need:

 - Some sort of *nix OS
 - Latest stable node.js (developed on 6.10)
 - Serial to USB adapter

To setup the client, plop this repository onto your client device (I
use a raspberry pi 3). Now adjust the configuration by editing 'config.json'.
If you are using this remotely, I recommend get a [keymetrics](http://keymetrics.io)
account and [linking your client device](http://docs.keymetrics.io/docs/usage/setup/).

Next, you're going to want to generate SSH key & certificate pair that is unique to
your setup. To do this, go to the `ssl/` folder in this repo and run `./gen.sh`. You
will need to put your server behind some domain for the code to work and for proper SSL
verification (configure this as your `SERVER_HOST` above). It also saves you money on buying
a static IP for your network since you can just change your IP on the domain. Make sure that
the domain you choose to use is the same one that you provide to `openssl` when generating
your certificate pair for the server. Once you have your keypair, keep it safe. It'll be your
only means of authentication.

Once you are satisfied with your config, run `npm install && npm start` which
should install your dependencies and get the client running via pm2. You can confirm
that the client started successfully by running `npm run monit` and your script should
be visible. Don't worry aboutt the errors that show up in the log, they're expected.

### Server setup

You'll need:

 - Any OS should do (though why would you want to use Windows?)
 - Latest stable node.js (developed on 6.10)
 - Network access
 - Control over your network (i.e. admin access to your router)

First, setup your network so that port `8093` (or whatever port you configured above)
is accessible publicly. If you have no idea what this means, you need to setup port
forwarding on your router. If you know what you're doing, DMZ zones and connecting to
your modem are fine too (I'm not responsible for what other ports you leave open).

Next, grab your public IP and setup the DNS of your domain to resolve properly.

You can now clone the repo locally, as long as you copy `ssl/client.crt` from your client
device to your server. Grab the dependencies by running `npm install`. Whenever you'd like
to connect to your serial device, simply run `node server`.

*Note: Before each run of `node server`, you can edit the local `config.json` file to change
your serial settings like baud rate and parity. These options are not read from file on the client,
they're sent when you connect. So don't worry if you have to make changes on the fly.*

## License

Licensed under [MIT license](LICENSE).
Copyright &copy; 2017 Karim Alibhai.