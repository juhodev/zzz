import Server from './server/server';
import * as dotenv from 'dotenv';
dotenv.config();

const server: Server = new Server();
server.listen();
