const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;

/*The "peers' variable below, checks if a peers enviroment variable has been decleared we'll assume that this 
peer env variable is a string that contains a list of websocket addresses that this websocket should coonect to as a peer*/

const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

/* The above checks if a peer environment variable has been declared, if not it pushes our websocket address "ws://localhost:5001" 
into an empty array, and as a result of the class written below,  anyone else who fires up the app will connect to our websocket server, and their 
websocket address "ws://localhost:5002" will be added to the array. (Notice the ws "websocket" protocol instead of http)*/

//PEERS = ws://localhost:5001,ws://localhost:5002 npm run dev

const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
};

/* The "connectSocket()" function grabs the socket created by the "connectToPeers()" function forEach peer,and it 
puts the peer into the sockets array. It then passes the socket to the "messageHandler()" function which synchronizes
the most up to date blockchain of everyone connected i.e everyone in the sockets array.

the "socket.send()" call is really what triggers the blockchain to be replaced by an updated one.

However we now also sending any transaction made, so everyone knows about every transaction. 
So we need to differentiate the message is a chain or a transaction, hence the "MESSAGE_TYPES" variable above.
So we can use those MESSAGE_TYPES when ever we send data over our sockets.

This is exactly what we then do in the edited connectToPeers(), messageHandler() and sendTransaction() functions.

Finally the broadcastTransaction() function can send all this stuff to the local index.js, where we can call it 
in the transact endpoint and everyone can see it. */

class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() {
        const server = new Websocket.Server({port: P2P_PORT})
        server.on('connection', (socket) => {
            this.connectSocket(socket);
        });
        this.connectToPeers();
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
        };

    connectToPeers() {
        peers.forEach((peer) => {
            const socket = new Websocket(peer);

            socket.on('open', () => {
                this.connectSocket(socket);
            });
        });
    }
    
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket Connected');

        this.messageHandler(socket);

        socket.send(JSON.stringify({ type: MESSAGE_TYPES.chain, chain: this.blockchain.chain}));
    }

    // Function below is listening for a message, which will prompt synchronization of blockchains
    messageHandler(socket) {
        socket.on('message', (message) => {
            const data = JSON.parse(message)
            //The switch statement allows us to run different cases depending on the different type to execute different code
            switch(data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;

            }
        });
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({ type: MESSAGE_TYPES.transaction, transaction: transaction}));
    }

    //The function below sends the updated blockchain of this current instance to all the socket peers.
    syncChains() {
        this.sockets.forEach((socket) => {
            socket.send(JSON.stringify({ type: MESSAGE_TYPES.chain, chain: this.blockchain.chain}));
        });
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }
}

module.exports = P2pServer;