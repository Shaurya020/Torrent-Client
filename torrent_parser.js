'use strict';
const fs = require('fs');
const bencode = require('bencode');
const buffer = require('buffer').Buffer;
const crypto = require('crypto');
const BN = require('bn.js');

module.exports.numFiles = (torrent) => {
    return torrent.info.files ? torrent.info.files.length : 1;
}

module.exports.open = (filepath) =>{
    return bencode.decode(fs.readFileSync(filepath));       //Decodes the file using file path
};

module.exports.infoHash = torrent =>{
    const info = bencode.encode(torrent.info);                   //Encodes the torrent info in bencode then later return hashed using crypto in SHA1 format
    return crypto.createHash('sha1').update(info).digest();     //Doubt regarding digest
}; 

module.exports.size = torrent =>{

    //info is present or not 
    const size = torrent.info.files ? torrent.info.files.map(file=>file.length).reduce((a,b)=> a+b): torrent.info.length;    //Used because file info may contain info about many files so adding all the file sizes if multiples files
    return new BN(size).toBuffer('be', 8);
};

module.exports.BLOCK_LEN = Math.pow(2, 14);
module.exports.pieceLen = (torrent, pieceIndex) => {
    
    const totalLength = new BN(this.size(torrent)).toNumber();
    const pieceLength = torrent.info['piece length'];
    const lastPieceLength = totalLength % pieceLength;
    const lastPieceIndex = Math.floor(totalLength / pieceLength);
  
    return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
};
  
module.exports.blocksPerPiece = (torrent, pieceIndex) => {
    const pieceLength = this.pieceLen(torrent, pieceIndex);
    return Math.ceil(pieceLength / this.BLOCK_LEN);
  };
  
module.exports.blockLen = (torrent, pieceIndex, blockIndex) => {
    const pieceLength = this.pieceLen(torrent, pieceIndex);
  
    const lastBlockLength = pieceLength % this.BLOCK_LEN;
    const lastBlockIndex = Math.floor(pieceLength / this.BLOCK_LEN);
  
    return blockIndex === lastBlockIndex ? lastBlockLength : this.BLOCK_LEN;
  };

module.exports.totalBlocks = (torrent) => {
    const totalLength = new BN(this.size(torrent)).toNumber();
    return Math.ceil(totalLength / this.BLOCK_LEN);
}