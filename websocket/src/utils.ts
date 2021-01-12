import * as crypto from 'crypto';

export function parseHTTPHeaders(data: Buffer): Map<string, string> {
	const values: Map<string, string> = new Map();

	// Might change this in the future I don't know
	const asString: string = data.toString();
	const lines: string[] = asString.split('\r\n');

	const typeOfMessage: string = lines.shift();
	// for testing I know that it'll always be GET / HTTP/1.1

	for (const line of lines) {
		if (line.length === 0) {
			continue;
		}
		const keyValueSplit: number = line.indexOf(':');
		const key: string = line.substr(0, keyValueSplit);
		const value: string = line.substr(keyValueSplit + 2, line.length);
		values.set(key, value);
	}

	return values;
}

export function createServerOpeningHandshake(clientHeaders: Map<string, string>): string {
	let handshake: string = '';
	handshake += 'HTTP/1.1 101 Switching Protocols\r\n';
	handshake += 'Upgrade: websocket\r\n';
	handshake += 'Connection: Upgrade\r\n';

	const secWebSocketKey: string = clientHeaders.get('Sec-WebSocket-Key');
	const concat: string = secWebSocketKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
	const sha: string = sha1(concat);

	handshake += `Sec-WebSocket-Accept: ${sha}\r\n\n`;

	return handshake;
}

function sha1(str: string): string {
	const sha = crypto.createHash('sha1');
	sha.update(str);
	return sha.digest('base64');
}
