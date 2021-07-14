'use strict';

const dgram = require('dgram');
const buffer = require('buffer').Buffer;
const urlParse = require('url').parse;
const crypto = require('crypto');
const torrent_parser = require('./torrent_parser');
const utils = require('./utils');

//parrot.torrent-5 jsbook.torrent-3,5,8 photoshop.torrent-2.5 Main Get Peers function
module.exports.getPeers = (torrent, callback) => {
    const socket = dgram.createSocket('udp4');

    //SCOPE FOR IMPROVEMENT: Here we need to change the index manually 
    const url = torrent["announce-list"][2].toString('utf8');

    //const url = torrent.announce.toString('utf8');     //if announce-list is not defined
    connectRequest(socket, url);
    
    socket.on('message', response =>{
        
        
        if(responseType(response)==='connect'){
            const connectionResponse = parseConnectionResponse(response);
            buildAnnounceRequest(connectionResponse.connectionId,torrent,socket,url);
        }
        
        else if(responseType(response)==='announce'){
            const announceResponse = parseAnnounceResponse(response);     
            callback(announceResponse.peers);       //this gives us the list of peers
        }
    });
};

function responseType(resp) {
    const action = resp.readUInt32BE(0);
    if (action === 0) return 'connect';
    if (action === 1) return 'announce';
}

function parseConnectionResponse(resp){
    
    return{
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.slice(8)
    }
}

function connectRequest(socket, main_url){
    const url = urlParse(main_url);
    const buf = buffer.alloc(16);
    buf.writeUInt32BE(0x417, 0);    //node.js only recognizes 32 bit integers, hence we break the 64 bit connection id into two halves
    buf.writeUInt32BE(0x27101980, 4);
    buf.writeUInt32BE(0,8);
    crypto.randomBytes(4).copy(buf,12);
    // console.log(url.port);
    socket.send(buf, 0, buf.length, url.port, url.hostname, ()=>{console.log("connect request sent")});
}

function buildAnnounceRequest(connectionId, torrent, socket, main_url, port = 6881){
    const buf = buffer.alloc(98);
    const url = urlParse(main_url);
    // connection Id
    connectionId.copy(buf, 0);
    
    //action
    buf.writeUInt32BE(1, 8);
    
    //transaction id
    crypto.randomBytes(4).copy(buf, 12);
    
    //info hash
    torrent_parser.infoHash(torrent).copy(buf, 16);

    // peerId
    utils.generalId().copy(buf, 36);
    
    // downloaded
    buffer.alloc(8).copy(buf, 56);
    
    // left
    torrent_parser.size(torrent).copy(buf, 64);
    
    // uploaded
    buffer.alloc(8).copy(buf, 72);
    
    // event
    buf.writeUInt32BE(0, 80);
    
    // ip address
    buf.writeUInt32BE(0, 84);
    
    // key
    crypto.randomBytes(4).copy(buf, 88);
    
    // num want
    buf.writeInt32BE(-1, 92);
    
    // port
    buf.writeUInt16BE(port, 96);
    
    socket.send(buf,0,buf.length,url.port,url.hostname,()=>{console.log("buildAnnounceRequest over!!")});
}



function parseAnnounceResponse(resp){
    console.log("parseAnnounceResponse called");
    function group(iterable, groupSize){
        
        let groups = [];
        for (let i = 0; i < iterable.length; i += groupSize){       //Iterable.length is the length of the peers list stream
            groups.push(iterable.slice(i, i + groupSize));
        }
        
        return groups;
    }

    return {
        
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        interval: resp.readUInt32BE(8),
        leechers: resp.readUInt32BE(12),
        seeders: resp.readUInt32BE(16),
        peers: group(resp.slice(20), 6).map(address=>{ //map used to call on each item in list returned by group
        
        return {    //peers contains a list of objects & each object have 2 attributes/whatever: ip & port
            ip: address.slice(0, 4).join('.'),
            port: address.readUInt16BE(4)
        }
        })
    }
    
}