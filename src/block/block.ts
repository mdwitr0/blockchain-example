import { SHA256 } from "crypto-js";
import { ITransaction } from "../transaction/transaction.interface";
import { IBlock } from "./block.interface";

export class Block implements IBlock {
    public timestamp!: number;
    public transactions!: ITransaction[];
    public previousHash!: string;
    public hash!: string;
    public nonce!: number;

    constructor(timestamp: number, transactions: ITransaction[], previousHash: string) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash(): string {
        return SHA256(this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce).toString();
    }
}