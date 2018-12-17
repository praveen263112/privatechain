const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const ChainClass = require('./simpleChain.js');

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
                      return JSON.parse(result);
                   }catch(err){
                       return "Block Not Found";
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