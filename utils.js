'use strict'
var fs = require('fs');
var crypto = require('crypto');

var checksum = function(str, algorithm, encoding){
  return crypto.createHash(algorithm || 'md5')
  .update(str, 'utf8')
  .digest(encoding || 'hex')
}

var hashFile = function(filePath, cb){
  //do stuff
  fs.readFile(filePath, function(err, data){
    if(!err) cb(checksum(data))
  })
}

var compare = function(hash, filePath, cb){
  //compare hash to hash of file
  hashFile(filePath, (Hash) => {
    var result = Hash === hash
    cb(result)
  })
}

module.exports = {compare: compare, hash: hashFile}