/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
    return db.put(key,value);// Returns a promise
}
// Get data from levelDB with key
function getLevelDBData(key){
  
  return new Promise(function(resolve,reject){
      db.get(key).then((result)=>{
          resolve(result)
      })
      .catch((error)=>reject(error))
  });
}

// Add data to levelDB with value
function addDataToLevelDB(height,value) {
    return new Promise(function(resolve,reject){
        db.createReadStream()
        .on('data',function(data){
            
        })
        .on('error',function(err){
            reject(err)
        })
        .on('close',function(){
            addLevelDBData(height,value).then(()=>{
              resolve("Block #" + height+" added");  
            })
            .catch(()=>{
              reject("Block #"+height+" cannot be added");
            });
            
        })
    });
}

/**
     * Step 2. Implement the getBlocksCount() method
     */
function getBlocksCount() {
        //let self = this;
        // Add your code here
        var key = [];
        return new Promise(function(resolve,reject){
               db.createReadStream()
                .on('data',function(data){
                key.push(data.key)
            })
            .on('error',function(err){
                reject(err)
            })
            .on('close',function(){
                resolve(key.length);
            })
        })
      }

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

//Snippet used for testing
//(function theLoop (i) {
//  setTimeout(function () {
//    addDataToLevelDB('Testing data');
//    if (--i) theLoop(i);
//  }, 100);
//})(10);

//addLevelDBData(1,400).then(result => getLevelDBData(1) ,error =>console.log("hiiii")).then();
//getLevelDBData(1).then((result)=> console.log(result)).catch((error)=>console.log("error"));

//Exporting modules
module.exports.addDataToLevelDB = addDataToLevelDB;
module.exports.getLevelDBData   = getLevelDBData;
module.exports.addLevelDBData   = addLevelDBData;
module.exports.getBlocksCount   = getBlocksCount;