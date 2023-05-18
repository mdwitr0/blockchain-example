import WebSocket from 'ws';

export interface IWsServer {
    broadcast(message: any): void;
}