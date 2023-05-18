import { Block } from "../block/block";
import { IBlock } from "../block/block.interface";
import { Transaction } from "../transaction/transaction";
import { ITransaction } from "../transaction/transaction.interface";
import { WsServer } from "../ws/ws-server";
import { IWsServer } from "../ws/ws-server.interface";
import { Balances, IBlockchain } from "./blockchain.interface";

export class Blockchain implements IBlockchain {
    private wsServer!: WsServer;
    
    public chain!: IBlock[];
    public pendingTransactions: ITransaction[] = [];
    public miningReward: number = 100;
    public difficulty: number = 1;
    public halvingInterval: number = 100;

    balances: Balances = {};

    constructor(wsServer: WsServer) {
        this.wsServer = wsServer;
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock(): IBlock {
        return new Block(this.wsServer, Date.now(), [], "0");
    }

    getLatestBlock(): IBlock {
        const latestIndex = this.chain.length - 1;
        return this.chain[latestIndex];
    }

    minePendingTransactions(miningRewardAddress: string): void {
        const latestBlock = this.getLatestBlock();
        const block = new Block(this.wsServer,Date.now(), this.pendingTransactions, latestBlock.hash);

        block.mineBlock(this.difficulty);

        this.chain.push(block);

        this.pendingTransactions.forEach(transaction => {
            this.balances[transaction.fromAddress] = this.getBalanceOfAddress(transaction.fromAddress) - transaction.amount;
            this.balances[transaction.toAddress] = this.getBalanceOfAddress(transaction.toAddress) + transaction.amount;
        });

        // Halving logic
        if (this.chain.length % this.halvingInterval === 0) {
            this.miningReward /= 2;
            this.difficulty += 1;
        }
    
        const transaction = new Transaction("", miningRewardAddress, this.miningReward);
        this.pendingTransactions = [transaction];
    }

    createTransaction(transaction: ITransaction): boolean {
        const senderBalance = this.getBalanceOfAddress(transaction.fromAddress);
        if (senderBalance < transaction.amount) {
            throw new Error('Not enough balance to perform this transaction');
        }
        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be positive');
        }

        const tx = new Transaction(transaction.fromAddress, transaction.toAddress, transaction.amount);
        this.pendingTransactions.push(tx);
        return true;
    }

    getBalanceOfAddress(address: string): number {
        return this.balances[address] || 0;
    }

    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    async getStats(): Promise<any> {
        const stats = {
            blocks: this.chain.length,
            difficulty: this.difficulty,
            miningReward: this.miningReward,
            halvingInterval: this.halvingInterval,
            pendingTransactions: this.pendingTransactions.length,
            isChainValid: this.isChainValid(),
        };

        return stats;
    }
}