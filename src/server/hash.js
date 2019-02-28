const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sha = crypto.createHash('sha256');

fs.readFile(path.join('..', '..', 'stonehenge.jpg'), function(err, data) {
    sha.update(data);
    let hash = sha.digest('hex');
    console.log(hash);
});