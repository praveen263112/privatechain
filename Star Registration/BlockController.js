const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const ChainClass = require('./simpleChain.js');
const hextoascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server 
     */
    constructor(server) {
        this.server = server;
        this.blockChain = new ChainClass.Blockchain();
        this.getBlockByHeight();
        this.postNewBlock();
        this.getBlockByHashOrAddress();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByHeight() {
        let self = this.blockChain;
        this.server.route({
            method: 'GET',
            path: '/block/{height}',
            handler: async (request, h) => {
                   
                   try{
                      let blockHeight = request.params.height;
                      if(blockHeight == null){
                          return "Invalid height"
                      }
                      let promise = self.getBlock(blockHeight);
                      let result = await promise;
                      if(result!=null){
                        let blockResult = JSON.parse(result);
                          
                        if(blockResult.height!=0){
                          blockResult.body.star.storyDecoded = hextoascii(blockResult.body.star.story);
                          return blockResult;
                        }else{
                            return blockResult;
                        }  
                      }else{
                          return "Block Not Found"
                      }

                   }catch(err){
                       return "Error while processing";
                   }
                }
            
        });
    }
    
    
     /**
     * Implement a GET Endpoint to retrieve a block by hash or url, url: "/api/stars"
     */
    getBlockByHashOrAddress(){
        
        let self = this.blockChain;
        this.server.route({
            method: 'GET',
            path: '/stars',
            handler: async (request, h) => {
                
                try{
                    
                    let queryParam = request.query;
                    if(queryParam.hash!=null){
                        let hash = queryParam.hash;
                         if(hash==null){
                            return "Provide valid hash";
                        }
                        if(hash.length==0){
                            return "Hash is empty";
                        }
                    
                        let promise = self.getBlockByHash(hash);
                        let result = await promise;
                        if(result!=null){
                           let blockResult = JSON.parse(result.value);
                           if(blockResult.height!=0){
                                  blockResult.body.star.storyDecoded = hextoascii(blockResult.body.star.story);
                              }
                    
                           return blockResult; 
                        }else{
                        return "No Block Found"
                        }   
                    }else if(queryParam.address!=null){
                        
                      let address = queryParam.address;
                         if(address==null){
                            return "Provide valid address";
                        }
                        if(address.length==0){
                            return "Address is empty";
                        }
                        let promise = self.getBlockByWalletAddress(address);
                        let result = await promise;
                        console.log(result);
                        let finalBlocks = [];
                        for(var i=0;i<result.length;i++){
                            let blockResult = JSON.parse(result[i]);
                            blockResult.body.star.storyDecoded = hextoascii(blockResult.body.star.story);
                            finalBlocks.push(blockResult);
                        }
                    
                        return finalBlocks;  
                        
                        
                    }else{
                        return "Please pass valid parameter";
                    }
                 
                }catch(err){
                    console.log(err);
                }
                
            }
        });
        
    }
    

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        let self = this.blockChain;
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: async (request, h) => {
                //Fetching block data from request body
                
                try{
                    let blockData = request.payload.body;
                //Check whether the data variable is empty   
                     if(blockData==null){
                        return "No block data added";
                    }
                    if(blockData.length==0){
                        return "Data is empty";
                    }
                    let promise = self.addBlock(new BlockClass.Block(blockData));
                    let result = await promise;
                    return result;
                }catch(err){
                    console.log(err);
                    return "Block cannot be added";
                }
                
            }
        });
    }
}

/**
 * Exporting the BlockController class
 * @param {*} server 
 */
module.exports = (server) => { return new BlockController(server);}