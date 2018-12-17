/* ===== Mempool Class ==============================
|  Class with a constructor for Mempool			   |
|  ===============================================*/

const bitcoinMessage = require('bitcoinjs-message');

class Mempool {
    
    constructor(){
       this.lookup = {}; // For faster lookup of request in array
       this.validRequestLookup = {}; // For faster lookup of valid request
       this.mempool = [];
       this.timeoutRequests = [];
       this.mempoolValid = [];
       this.timeoutMempoolValid = [];
   }
    
    addRequestValidation(request){
        let self = this;
        const TimeoutRequestsWindowTime = 5*60*1000;
        //Checks if the request already present in the mempool
        let index = this.lookup[request.walletAddress];
        let mempoolIndex = this.validRequestLookup[request.walletAddress];
        if(mempoolIndex!=null){
            return "A valid request has already made and signature is verified.Please submit the star data before the request expires";
        }
        if(index ==null){
            //Adding new request to the mempool
            let timeElapse = (this.getCurrentTimeInUnixSeconds()) - request.requestTimeStamp;
            let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
            request.validationWindow = timeLeft;
            index = this.mempool.push(request)-1;
            //For faster lookup of the request
            this.lookup[request.walletAddress]=index;
            //Timeout of 5 minutes
            this.timeoutRequests[request.walletAddress]=setTimeout(function(){ self.removeValidationRequest(request.walletAddress) }, TimeoutRequestsWindowTime );
            return request;
        }else{
            //Updating the already created request in the mempool with new validation window
            let reqObj = this.mempool[index];
            reqObj.requestTimeStamp = this.mempool[index].requestTimeStamp;
            
            let timeElapse = (this.getCurrentTimeInUnixSeconds()) - reqObj.requestTimeStamp;
            let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
            
            reqObj.validationWindow = timeLeft;
            return reqObj;
            
        }
            
    }
    
    removeValidationRequest(address){
        //Cleaning up the mempool,lookup table and timeoutRequest array
        let index = this.lookup[address];
        delete this.lookup[address];
        delete this.mempool[index];
        clearTimeout(this.timeoutRequests[address]);
        delete this.timeoutRequests[address];
        
    }
    
    
    validateRequestByWallet(address,signature,timeStamp){
        let self = this;
        const TimeoutMempoolValidWindowTime = 30*60*1000;
        //Checks if the request already present in the mempool
        let index = this.lookup[address];
        if(index ==null){
            return "Please submit temporal validation request";
        }else{
            let message = this.mempool[index].message;
            try{
                
              if(bitcoinMessage.verify(message,address,signature)){
                
              let memPoolValidIndex = this.validRequestLookup[address];
              if(memPoolValidIndex ==null){
               clearTimeout(this.timeoutRequests[address]);
               delete this.timeoutRequests[address]; 
               let timeElapse = (this.getCurrentTimeInUnixSeconds()) - timeStamp;
               let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
               
                let tempObj = {
                    "registerStar":true,
                    "status":{
                        "address":address,
                        "requestTimeStamp":timeStamp,
                        "message":message,
                        "validationWindow":timeLeft,
                        "messageSignature":true
                    }
                };
                console.log(tempObj);
                memPoolValidIndex = this.mempoolValid.push(tempObj)-1;
                //For faster lookup of the request
                this.validRequestLookup[address]=memPoolValidIndex;
                  
                  //Timeout of 30 minutes
                this.timeoutMempoolValid[address]=setTimeout(function(){ self.removeValidRequest(address) }, TimeoutMempoolValidWindowTime );
                return tempObj;
        
              }else{
                  
                let timeElapse = (this.getCurrentTimeInUnixSeconds()) - this.mempoolValid[index].status.requestTimeStamp;
                let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
                  
                this.mempoolValid[index].status.validationWindow=timeLeft;
                return this.mempoolValid[index];
               }
                
              }else{
                return "Signature not valid";
            }
            }catch(err){
                return "Please verify the signature length";
            }
            
        
        }
        
    }
    
    
     removeValidRequest(address){
        //Cleaning up the mempool,lookup table and timeoutRequest array
         
        this.removeValidationRequest(address);
        let index = this.validRequestLookup[address];
        delete this.validRequestLookup[address];
        delete this.mempoolValid[index];
        clearTimeout(this.timeoutMempoolValid[address]);
        delete this.timeoutMempoolValid[address];
        
    }
    
    
    
    verifyAddressRequest(address){
        let index = this.validRequestLookup[address];
        if(index==null){
            return false;
        }else{
            return true;
        }     
    }
    
    
    
   verifyStarParameters(star){
       let obj = {};
           
           if(!("ra" in star)){  
               obj.ra = "RA parameter missing";
           }else{
               if(star.ra.length==0){
                obj.ra = "RA is empty";
               }
           }
           
           if(!("dec" in star)){  
               obj.dec = "DEC parameter missing";
           }else{
               if(star.dec.length==0){
                obj.dec = "DEC is empty";
               }
           }
           
           if(!("story" in star)){  
               obj.story = "Story parameter missing";
           }else{
               if(star.story.length>=500 || star.story.length==0){
                obj.story = "Story is empty or greater than 500 bytes";
               }
               
               let str = star.story;
               for(var i=0;i<str.length;i++){
                    if(str.charCodeAt(i)>127){
                        obj.storyType = "Text entered is not ASCII"
                    }
                }
               
           }
       
       let objLength = Object.keys(obj).length;
       if(objLength>0){
           return {
               "result":false,
               "error":obj
           }
       }else{
           return{
               "result":true
           }
       }
   
   }
    
    
    getCurrentTimeInUnixSeconds(){
        return new Date().getTime().toString().slice(0,-3);
    }
    
    
    fortesting(){
        console.log(this.mempool);
        console.log(this.lookup);
        console.log(this.timeoutRequests);
        console.log("-----------------------------------------------------------")
        console.log(this.mempoolValid);
        console.log(this.validRequestLookup);
        console.log(this.timeoutMempoolValid);
    }
}


module.exports.Mempool = Mempool;
