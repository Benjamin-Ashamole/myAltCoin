const Block = require('./block');

class Blockchain {
    constructor(){
        this.chain = [Block.genesis()];
    }
    addBlock(data){
        const lastBlock = this.chain[this.chain.length-1];
        const block = Block.mineBlock(lastBlock, data);
        this.chain.push(block);

        return block;
    }

    isValidChain(chain){
        /* first check if the genesis block matches the right genesis block we created*/ 
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
        return false;
        /*Next we run validation on every following block after the genesis block in the incoming chain and make sure its 
        lastHash value matches the hash of the block prior to it.
        It is also possible that a block data itself has been tampered with, and its generated hash is incorrect. 
        So in that case, we should check that the current block's hash matches a generated hash for the current block */
        for (let i=1; i<chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i-1];

            if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)) {
                return false;
            }
        }
        return true;
    }

    replaceChain(newChain) {
        if (newChain.length <= this.chain.length){
            console.log('Recieved chain is not longer than current chain.');
            return;
        }
        else if (!this.isValidChain(newChain)){
            console.log('The recieved chain is not valid.');
            return;
        
        }
        console.log('Replacing blockchain with the new chain.');
        this.chain = newChain;
    }
}

module.exports = Blockchain;