import { WebSocketServer, WebSocket } from 'ws';
export declare class WebSocketService {
    private wss;
    private clients;
    constructor(wss: WebSocketServer);
    private setupWebSocket;
    private handleMessage;
    sendToClient(ws: WebSocket, data: any): void;
    broadcast(type: string, data: any): void;
    getClientCount(): number;
}
//# sourceMappingURL=WebSocketService.d.ts.map