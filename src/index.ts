import express from "express";
import { Blockchain } from "./blockchain/blockchain";
import { Transaction } from "./transaction/transaction";
import { WsServer } from "./ws/ws-server";

const wsServer = new WsServer(8088);

const blockchain = new Blockchain(wsServer);
const app = express();
app.use(express.json());

app.post("/transaction", async (req, res) => {
    const { fromAddress, toAddress, amount } = req.body;
    const transaction = new Transaction(fromAddress, toAddress, amount);
    try {
        await blockchain.createTransaction(transaction);
        res.send({ message: "Transaction will be added in the next mined block.", transaction });
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

app.get("/balance/:address", async (req, res) => {
    const { address } = req.params;
    const balance = await blockchain.getBalanceOfAddress(address);
    res.send({ balance });
});

app.post("/mine", async (req, res) => {
    const { minerAddress } = req.body;
    await blockchain.minePendingTransactions(minerAddress);
    res.send("Block successfully mined.");
});

app.get("/stats", async (req, res) => {
    const stats = await blockchain.getStats();
    res.send(stats);
});

app.listen(3000, () => console.log("Server running on port 3000"));

