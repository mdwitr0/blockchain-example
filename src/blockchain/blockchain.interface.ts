import { IBlock } from "../block/block.interface";
import { ITransaction } from "../transaction/transaction.interface";

export type Balances = { [key: string]: number };

export interface IBlockchain {
    chain: IBlock[];
    pendingTransactions: ITransaction[];
    miningReward: number;
    balances: Balances;
    
    createGenesisBlock(): IBlock;
    getLatestBlock(): IBlock;
    minePendingTransactions(miningRewardAddress: string): void;
    createTransaction(transaction: ITransaction): boolean;
    getBalanceOfAddress(address: string): number;
    isChainValid(): boolean;
}