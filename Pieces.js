'use strict';
const tp = require('./torrent_parser');

//Used to calculate download percentage
var currentPiece = -1;
var piecesReceived = 0;
var totalPieces = 0;

module.exports = class {
  constructor(torrent) {
    function buildPiecesArray() {
      const nPieces = torrent.info.pieces.length / 20;
      totalPieces = nPieces;
      const arr = new Array(nPieces).fill(null);
      return arr.map((_, i) => new Array(tp.blocksPerPiece(torrent, i)).fill(false));
    }

    this._requested = buildPiecesArray();
    this._received = buildPiecesArray();
  }
  
  addRequested(pieceBlock) {
    const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;
    this._requested[pieceBlock.index][blockIndex] = true;
  }
  
  addReceived(pieceBlock) {
    
    // console.log("pB");
    const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;
    this._received[pieceBlock.index][blockIndex] = true;
    
    // if(currentPiece != pieceBlock.index){
    //   currentPiece = pieceBlock.index ;
    //   piecesReceived = piecesReceived + 1;
    //   if(100*(piecesReceived)/(totalPieces)<100){console.log("Download percentage: ", (100*(piecesReceived)/(totalPieces)), "%")};
    // }
  }

  needed(pieceBlock) {
    if (this._requested.every(block => block.every(i => i))) {
      this._requested = this._received.map(block => block.slice());
    }
    const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;
    return !this._requested[pieceBlock.index][blockIndex];
  }

  isDone() {
    return this._received.every(block => block.every(i => i));
  }
};