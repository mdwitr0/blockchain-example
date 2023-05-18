import { ITransaction } from "../transaction/transaction.interface";

export interface IBlock {
    timestamp: number;
    transactions: ITransaction[];
    previousHash: string;
    hash: string;
    nonce: number;

    calculateHash(): string;
    mineBlock(difficulty: number): void;
}