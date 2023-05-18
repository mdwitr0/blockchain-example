import { SHA256 } from "crypto-js";
import { ITransaction } from "../transaction/transaction.interface";
import { IBlock } from "./block.interface";
import { WsServer } from '../ws/ws-server';

export class Block implements IBlock {
    private wsServer: WsServer;

    public timestamp!: number;
    public transactions!: ITransaction[];
    public previousHash!: string;
    public hash!: string;
    public nonce: number = 0;

    constructor(wsServer: WsServer, timestamp: number, transactions: ITransaction[], previousHash: string = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.wsServer = wsServer;
    }

    calculateHash(): string {
        return SHA256(this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
    
            // Broadcast the mining progress
            this.wsServer.broadcast({
                message: 'Mining progress',
                block: this.hash,
                nonce: this.nonce,
                hash: this.hash
            });
        }

        console.log("Block mined: " + this.hash);

        // Broadcast the mined block
        this.wsServer.broadcast({
            message: 'Block mined',
            block: this.hash
        });
    }
}