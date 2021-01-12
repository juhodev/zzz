import * as net from 'net';
import WSClient from '../client/WSClient';

class WSServer {
	port: number;
	onConnection: (client: WSClient) => void;

	constructor() {}

	listen(port?: number) {
		this.port = port || 3000;

		const socketServer: net.Server = net.createServer((socket) => {
			const wsClient: WSClient = new WSClient();
			wsClient.attach(socket);

			if (this.onConnection !== undefined) {
				this.onConnection(wsClient);
			}
		});

		socketServer.listen(this.port);
	}
}

export default WSServer;
