import WSClient from './client/WSClient';
import WSServer from './server/WSServer';

const wsServer: WSServer = new WSServer();

wsServer.listen(3000);
wsServer.onConnection = (client: WSClient) => {
	client.on('message', (message) => {
		console.log('message from client:', message);
		client.write('this is a test message that is written to the client', 12);
	});
};

console.log('listening on port 3000');
