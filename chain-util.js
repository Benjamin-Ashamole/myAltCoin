const EC = require('elliptic').ec;
/*The elliptic module is going to generate our keypair*/

const uuidV1 = require('uuid/v1');
/*uuid- universal unique identifier
This uuid gives us a function which can generate a random string of 32 characters that is partly based on the 
current time in order to create unique IDs for objects */

const ec = new EC('secp256k1');

const SHA256 = require('crypto-js/sha256');

class ChainUtil {
    static genKeyPair() {
        return ec.genKeyPair();
    }
    /*The elliptic module has the "genKeyPair" function built into it. So we write our own genKeyPair static function 
    and then call the ec.genKeyPair() so we can call it without having to instantiate it every time
    
    elliptic also has a sign method which can be used to generate a signature based on given data
    */
   static id() {
       return uuidV1();
   }

   static hash(data) {
       return SHA256(JSON.stringify(data)).toString();
   }

   static verifySignature(publicKey, signature, dataHash) {
       return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
   }
   /*elliptic also provides a verify method that will return true or false value to represent the validity of an 
   incoming signature */
}

/*We aim to create a system where multiple users are submitting transactions to a collection and then miners on the 
blockchain network will take a chunk of transactions in a collection and include that data in the blockchain. 
Miners should only be able to take valid transactions, therefore miners must verify the signature to make sure
the transaction is valid */
module.exports = ChainUtil;

