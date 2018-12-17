const MempoolClass = require('./Mempool.js');
const RequestClass = require('./Request.js');
const BlockClass = require('./Block.js');
const hextoascii = require('hex2ascii');

class MempoolController{
    /**
     * Constructor to create a new MempoolController, you need to initialize here all your endpoints
     * @param {*} server 
     */
    constructor(server) { 
        this.server = server;
        this.mempool = new MempoolClass.Mempool();
        this.requestValidation();
        this.validateSignature();
        this.storeStarData();
        this.test();
    }

    
    /**
     * Implement a POST Endpoint to validation request, url: "/api/requestValidation"
     */
    requestValidation() {
        this.server.route({
            method: 'POST',
            path: '/api/requestValidation',
            handler: async (request, h) => {                
                try{
                    
                    let address = request.payload.address;
                    //Check whether the address variable is empty   
                     if(address==null){
                        return "Invalid Address";
                    }
                    if(address.length==0){
                        return "Provide a valid address";
                    }
                    
                    //Creating request object
                    let req = new RequestClass.Request();
                    req.walletAddress = address;
                    req.requestTimeStamp = (new Date().getTime().toString().slice(0,-3));
                    req.message = req.walletAddress+":"+req.requestTimeStamp+":"+"starRegistry";
                    //Adding request to mempool
                    return this.mempool.addRequestValidation(req);
                 
                }catch(err){
                    console.log(err);
                    return "Validation request cannot be created";
                }
                
            }
        });
    }
    
     /**
     * Implement a POST Endpoint to validate signature, url: "/api/message-signature/validate"
     */
    validateSignature(){
        
        this.server.route({
            method: 'POST',
            path: '/api/message-signature/validate',
            handler: async (request, h) => {                
            
                try{
                    
                    let address = request.payload.address;
                    let signature = request.payload.signature;
                    
                     if(address==null || signature==null){
                        return "Invalid Parameter";
                    }
                    if(address.length==0 || signature.length==0){
                        return "Empty value cannot be passed";
                    }
                    
                    let timeStamp = (new Date().getTime().toString().slice(0,-3))
                    return this.mempool.validateRequestByWallet(address,signature,timeStamp);
                    
                    
                }catch(err){
                    return err;
                    }
            }
        });
        
        
        
    }
    
    // To store the star details in the chain. URL :/api/block
    storeStarData(){
        
         this.server.route({
            method: 'POST',
            path: '/api/block',
            handler: async (request, h) => {  
        
                try{
                    //Check for single star details
                    let requestObj = request.payload;
                    //Verifying the count of parameters
                    let noOfParameters= Object.keys(requestObj).length;
                    if(noOfParameters == 2){
                        //Fetching address and star details from the request
                        let address = request.payload.address;
                        let starData = request.payload.star;
                        
                        //Verfiying whether the address is validated in past 30 minutes
                        if(this.mempool.verifyAddressRequest(address)){
                            let paramCheck = this.mempool.verifyStarParameters(starData);
                            if(paramCheck.result==false){
                                return paramCheck.error;
                            }
                            
                            if(!("mag" in starData)){
                                starData.mag="";
                            }
                            
                            if(!("cen" in starData)){
                                starData.cen="";
                            }
                            let body = {
                                "address":address,
                                "star":{
                                    "ra":starData.ra,
                                    "dec":starData.dec,
                                    "mag":starData.mag,
                                    "cen":starData.cen,
                                    "story":new Buffer(starData.story).toString('hex')
                                }
                            };
                            
                            //Calling the postNewBlock API in blockController
                            const injectOptions = {
                                    method: 'POST',
                                    url: '/block',
                                    payload: {
                                    body:body
                                  }
                                };
                            
                            const response = await this.server.inject(injectOptions);
                            let blockResult = JSON.parse(response.payload);
                            //Adding decoded story to the object
                            blockResult.body.star.storyDecoded = hextoascii(blockResult.body.star.story);
                            this.mempool.removeValidRequest(address);
                            return blockResult;
                        }else{
                            return "Please send validation request once again";
                        }
                        
                    }else{
                        return "Please send a valid address and details of a single star";
                    }
                
                 //new BlockClass.Block(data)

                }catch(err){
                    console.log(err);
                    
                }
       }
        });
        
    }
    
    test(){
        
        this.server.route({
            method: 'POST',
            path: '/api/test',
            handler: async (request, h) => {  
        
                try{
                let address = request.payload.address;
                let starData = request.payload.star;
                
                return this.mempool.verifyStarParameters(starData);
                }catch(err){
                    console.log(err);
                }
                
            }
            
        });
          
    }
//    
}
    
/**
 * Exporting the MempoolController class
 * @param {*} server 
 */
module.exports = (server) => { return new MempoolController(server);}