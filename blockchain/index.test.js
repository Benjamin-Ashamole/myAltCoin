const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain', () =>{
    let bc, bc2;

    beforeEach(() =>{
        bc = new Blockchain();
        bc2 = new Blockchain();
    });

    it('start with the genesis block', () =>{
        expect(bc.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block', () => {
        const data = 'foo';
        bc.addBlock(data);

        expect(bc.chain[bc.chain.length-1].data).toEqual(data);
    });

    it('validates a valid chain', () => {
        bc2.addBlock('foo');

        expect(bc.isValidChain(bc2.chain)).toBe(true);
    });

    it('invalidates a chain with a corrupt genesis block', () => {
        bc2.chain[0].data ='fool';

        expect(bc.isValidChain(bc2.chain)).toBe(false);
    })

    it('invalidates a corrupt chain', () =>{
        bc2.addBlock('foo');
        bc2.chain[1].data = 'not foo';

        expect(bc.isValidChain(bc2.chain)).toBe(false);
    })

    it('replaces the current chain with the new valid chain', () =>{
        bc2.addBlock('goo');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).toEqual(bc2.chain);
    });

    it('does not replace the chain with a chain that is less than or equal to its length', () => {
        bc.addBlock('foo');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).not.toEqual(bc2.chain);
    })

});