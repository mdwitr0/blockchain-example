import { Block } from "../block/block";
import { IBlock } from "../block/block.interface";
import { Transaction } from "../transaction/transaction";
import { ITransaction } from "../transaction/transaction.interface";
import { Balances, IBlockchain } from "./blockchain.interface";

export class Blockchain implements IBlockchain {
    public chain!: IBlock[];
    public pendingTransactions: ITransaction[] = [];
    public miningReward: number = 100;
    balances: Balances = {};

    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock(): IBlock {
        return new Block(Date.now(), [], "0");
    }

    getLatestBlock(): IBlock {
        const latestIndex = this.chain.length - 1;
        return this.chain[latestIndex];
    }

    minePendingTransactions(miningRewardAddress: string): void {
        const latestBlock = this.getLatestBlock();
        const block = new Block(Date.now(), this.pendingTransactions, latestBlock.hash);
        this.chain.push(block);

        this.pendingTransactions.forEach(transaction => {
            this.balances[transaction.fromAddress] = this.getBalanceOfAddress(transaction.fromAddress) - transaction.amount;
            this.balances[transaction.toAddress] = this.getBalanceOfAddress(transaction.toAddress) + transaction.amount;
        });

        const transaction = new Transaction("", miningRewardAddress, this.miningReward);
        this.pendingTransactions = [transaction];
    }

    createTransaction(transaction: ITransaction): boolean {
        const balance = this.getBalanceOfAddress(transaction.fromAddress);
        if (balance < transaction.amount) {
            console.log('Not enough balance to perform this transaction');
            return false;
        }

        this.pendingTransactions.push(transaction);
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
}