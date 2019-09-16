const Wallet = require('../wallet');
const transaction = require('../wallet/transaction');

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.waller = wallet;
        this.p2pServer = p2pServer;
    }

    /*This "mine()" function will grab transactions from the pool, then it will create a block whose data consists 
    of those transactions, then it will tell the p2pserver to synchronize the chains and the new block with
    those transactions. then it should tell the transactionPool to clear itself of all transactions. */
    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        // include a reward for miner at the end of the transaction list
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
        // create a block consisting of the valid transaction
        const block = this.blockchain.addBlock(validTransactions);
        // synchronize chains in the p2p server
        this.p2pServer.syncChains();
        // clear the transaction pool
        this.transactionPool.clear();
        // broadcast to every miner to clear their transaction pools
        this.p2pServer.broadcastClearTransactions();

        return block;

    }
    

}

module.exports = Miner;