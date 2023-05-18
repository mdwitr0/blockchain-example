import WebSocket from 'ws';
import { IWsServer } from './ws-server.interface';

export class WsServer implements IWsServer {
    private wss: WebSocket.Server;

    constructor(port: number) {
        this.wss = new WebSocket.Server({ port });

        this.wss.on('connection', ws => {
            ws.send(JSON.stringify({message: 'Welcome to the blockchain!'}));
        });
    }

    public broadcast(message: any): void {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(JSON.stringify(message));
                } catch (error) {
                    console.error(`Failed to send message: ${error}`);
                }
            }
        });
    }
}