import * as tls from 'tls';
import Client from './client';
import * as fs from 'fs';

class Server {
	port: number;

	listen(port?: number) {
		this.port = port || 443;

		const { SERVER_KEY, SERVER_CERT } = process.env;

		const options: any = {
			key: fs.readFileSync(SERVER_KEY),
			cert: fs.readFileSync(SERVER_CERT),
			rejectUnauthorized: true,
			ALPNProtocols: ['h2'],
		};

		const server: tls.Server = tls.createServer(options, (socket) => {
			console.log('connection');
			const client: Client = new Client();
			client.attach(socket);
		});

		server.listen(this.port, () => {
			console.log('running server on port', this.port);
		});
	}
}

export default Server;
