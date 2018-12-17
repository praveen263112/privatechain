/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

// Included levelSandbox methods which has the level NodeJS library and is used as the data interaction layer.
const levelDB = require('./levelSandbox.js');
//Included Block class
const BlockClass = require('./Block.js');


/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
    
  constructor(){
      this.getBlockHeight().then(result=>{
          if(result<0){
                   this.addBlock(new BlockClass.Block("First block in the chain - Genesis block")); 
          }
      })
  }

  // Add new block
  addBlock(newBlock){
      let self = this;
      return new Promise(function (resolve,reject){
          //Fetching the current block height.
      self.getBlockHeight().then(result=>{
           
           // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0,-3);
          //Previous Block Hash
            if(result>=0){
                // Block height
                newBlock.height = result+1;
                // Adding block object to LevelDB
                self.getBlock(result)
                .then(result=>{
                    newBlock.previousBlockHash = JSON.parse(result).hash;
                    // Block hash with SHA256 using newBlock and converting to a string
                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                    let blockCreated = newBlock;
                    levelDB.addDataToLevelDB(newBlock.height,JSON.stringify(newBlock))
                    .then(result=>{console.log(result);resolve(blockCreated);})
                    .catch(error=>console.log(error));
                })
                .catch(error=>console.log(error));
                
            }else{
                // Executes if genesis block hasn't created yet.
                newBlock.height = 0;
                newBlock.previousBlockHash = '0x';
                    // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                levelDB.addDataToLevelDB(0,JSON.stringify(newBlock))
                .then(result=>console.log(result))
                .catch(error=>console.log(error));
            }
            
      });
      });
      
      
  }

  // Get block height
    getBlockHeight(){
      return new Promise(function(resolve,reject){
          levelDB.getBlocksCount()
              .then(result=>resolve(result-1))
              .catch(error=>reject(error));
      }); 
    }

    // get block
    getBlock(blockHeight){
      // return object as a single string
      return new Promise(function(resolve,reject){
            levelDB.getLevelDBData(blockHeight)
            .then(result=>{
                resolve(JSON.parse(JSON.stringify(result)));
            })
            .catch(error=>reject(error));    
      });
      
    }

    // validate block
    validateBlock(blockHeight){ 
        let self=this;
        return new Promise(function(resolve,reject){
          self.getBlock(blockHeight).then(result=>{
            //Block
          let block = JSON.parse(result);
          // get block hash
          let blockHash = block.hash;
          // remove block hash to test block integrity
          block.hash='';
           // generate block hash
          let validBlockHash = SHA256(JSON.stringify(block)).toString();
          // Compare
          if (blockHash===validBlockHash) {
            resolve( true);
            }else{
            resolve(false);
            }
        })
        .catch(error=>console.log(error));
      });
      
        
    }

   // Validate blockchain
    validateChain(){
      let self = this;
      let errorLog = [];
      let promises =[];
      self.getBlockHeight().then(result=>{
          let blockHeight =result;
          // If Chain is empty
          if(blockHeight<0){
              console.log("No Blocks present in the chain");
          }else{
              //For each validation,adding a promise to promises.
              for (var i=0;i<blockHeight;i++){
                  // Generating a promise and pushing it to the array.
                  promises.push(new Promise(function(resolve,reject){
                      // Storing the index of Blocks to be validated
                      let firstBlockIndex =i; 
                      let secondBlockIndex =i+1;
                      if(secondBlockIndex==blockHeight){
                          self.validateBlock(secondBlockIndex)
                          .then(result=>{
                              if(!result)errorLog.push(secondBlockIndex);
                          })
                      }
                      //Integrity check on Block
                      self.validateBlock(firstBlockIndex)
                      .then(result=>{
                          if(!result)errorLog.push(firstBlockIndex);
                          //Fetching first block details
                          self.getBlock(firstBlockIndex).then(result=>{
                             return result;
                          })
                          .then(result=>{
                              let firstBlock = result;
                              //fetching second block details
                              self.getBlock(secondBlockIndex).then(result=>{
                                  let secondBlock = result;
                                  //Matching the hash
                                  if(JSON.parse(firstBlock).hash!==JSON.parse(secondBlock).previousBlockHash){
                                      errorLog.push(firstBlockIndex);
                                  }
                               resolve();
                              });
                          })
                      });
                      
                  }));
              }
              //Executes once all the promises get resolved.
              Promise.all(promises).then(()=>{
                  if (errorLog.length>0) {
                    console.log('Block errors = ' + errorLog.length);
                    console.log('Blocks: '+errorLog);
                      return false;
                  } else {
                    console.log('No errors detected');
                      return true;
                  }
              }).catch(error=>console.log(error));
          }
      });  
    }
}

module.exports.Blockchain = Blockchain;

//let blockchain = new Blockchain();
//(function theLoop (i) {
//	setTimeout(function () {
//		//Test Object
//      	blockchain.addBlock(new BlockClass.Block("Praveen"));
//        i++;
//		if (i < 10) { 
//          theLoop(i) 
//        } else {
//        	console.log('Done')
//        }
//	}, 5600);
//  })(1);

//blockchain.getBlockHeight().then(result=>console.log(result));
//blockchain.getBlock(11).then(result=>console.log(result));
//blockchain.addBlock(new Block("This is for test"));
//blockchain.validateBlock(7).then(result=>console.log(result));
//blockchain.validateChain();
//blockchain.getBlock(1).then(block=>{
//    block=JSON.parse(block);
//    levelDB.addDataToLevelDB(3,JSON.stringify(block));
//})
//blockchain.getBlock(2).then(block=>{
//    block=JSON.parse(block);
//    block.body="error";
//    levelDB.addDataToLevelDB(2,JSON.stringify(block));
//});
