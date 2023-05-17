import { ITransaction } from "./transaction.interface";

export class Transaction implements ITransaction {
    constructor(
        public fromAddress: string,
        public toAddress: string,
        public amount: number
    ) { }
}
