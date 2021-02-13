//Personal Client ID
const crypto =require('crypto');

let id= null;
module.exports.generalId = () =>{
    if(!id){
        id = crypto.randomBytes(20);
        Buffer.from('-BP0001-').copy(id,0);
    }
    return id;
};