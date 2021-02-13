'use strict';
const fs = require('fs');
const bencode = require('bencode');
const tracker = require('./tracker');
const torrent_parser = require('./torrent_parser');
const download = require('./download');

const torrent = torrent_parser.open(process.argv[2]);

tracker.getPeers(torrent, peers => {
    console.log('list of peers: ', peers);
});

download.getMessageResponse(torrent, torrent.info.files[0].path.toString('utf-8'));