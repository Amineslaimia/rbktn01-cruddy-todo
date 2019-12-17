const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const readFilePromise = Promise.promisify(fs.readFile);

// var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////
exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    var filepath = path.join(exports.dataDir, `${id}.txt`);

    fs.writeFile(filepath, text, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null, {id, text});
      }
    });
  });
};



// exports.readAll = (callback) => {
//   var data =[]
//  fs.readdir(exports.dataDir,  async function (err, files) {
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }else{
//     //listing all files using forEach
//     files.forEach( function (file) {
//         // Do whatever you want to do with the file
//        exports.readOne(file.slice(0,5),(err,obj)=>{
//           if(err){
//             return err
//           }else{
//             data.push(obj.fileData.toString())
//           }
//         });
//     });
//    await callback(null, data);
//   }

// });


// };

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('Error reading all folders.');
    }
    var data = _.map(files, (file) => {
      var id = path.basename(file, '.txt');
      var filepath = path.join(exports.dataDir, file);
      return readFilePromise(filepath).then(fileData => {
        return {
          id: id,
          text: fileData.toString()
        };
      });
    });
    Promise.all(data)
      .then(items => callback(null, items), err => callback(err));
  });
};

exports.readOne = (id, callback) => {
  var filepath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filepath, (err, fileData) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
      } else
      {
      callback(null, { id, fileData });
    }
  });
};

exports.update = (id, text, callback) => {
  var filepath = path.join(exports.dataDir, `${id}.txt`);
  fs.writeFile(filepath, text,  (err)=>{
    if(err){
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback(null, { id, text });
  }
  })
}

exports.delete = (id, callback) => {
  var filepath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filepath, (err)=>{
  if (err) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
})
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
