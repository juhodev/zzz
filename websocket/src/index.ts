import WSClient from './client/WSClient';
import WSServer from './server/WSServer';

const wsServer: WSServer = new WSServer();

wsServer.listen(3000);
wsServer.onConnection = (client: WSClient) => {
	client.on('message', (message) => {
		console.log('message from client:', message);
		client.write('this is a test message that is written to the client');
		client.ping();
	});

	client.on('close', (message) => {
		console.log(`Connection closed to the client (${message})`);
	});
};

console.log('listening on port 3000');

const client: WSClient = new WSClient();
client.connect('localhost', 3000);

client.on('connection', () => {
	client.write('this is a test message from the client');
});

client.on('message', (message) => {
	console.log('Received from server', message);
});

client.on('close', (message) => {
	console.error('the server closed the connection', message);
});
