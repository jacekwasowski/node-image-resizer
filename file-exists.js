const fileExists = require('file-exists');

module.exports = file => new Promise((resolve, reject) => {
  fileExists(file, (err, exists) => {
    if (err) {
      reject(err);
    } else {
      resolve(exists);
    }
  });
});
