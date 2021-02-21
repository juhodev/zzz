// import Flags from '../../flags';
// import HeadersFrame from '../headersFrame';
// import { HeadersFrameFlags } from '../types';
// import * as ByteBuffer from 'bytebuffer';

// test('creates a basic headers frame', () => {
// 	const headersFrame: HeadersFrame = new HeadersFrame();
// 	headersFrame.createHeadersFrame(1, 1, [], new Flags());

// 	const buffer: Buffer = headersFrame.toBuffer();
// 	expect([...buffer]).toStrictEqual([0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1]);
// });

// test('create a headers frame with headers within in', () => {
// 	const headersFrame: HeadersFrame = new HeadersFrame();
// 	headersFrame.createHeadersFrame(
// 		1,
// 		1,
// 		[
// 			[':scheme', 'http'],
// 			[':path', '/'],
// 		],
// 		new Flags(),
// 	);

// 	const buffer: Buffer = headersFrame.toBuffer();
// 	expect([...buffer]).toStrictEqual([0x0, 0x0, 0x2, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x86, 0x84]);
// });

// test('create a headers frame with small padding', () => {
// 	const headersFrame: HeadersFrame = new HeadersFrame();
// 	headersFrame.createHeadersFrame(
// 		1,
// 		1,
// 		[
// 			[':scheme', 'http'],
// 			[':path', '/'],
// 		],
// 		new Flags().add({ data: 4, flag: HeadersFrameFlags.PADDED }),
// 	);

// 	const buffer: Buffer = headersFrame.toBuffer();
// 	expect([...buffer]).toStrictEqual([
// 		0x0,
// 		0x0,
// 		0x6,
// 		0x1,
// 		0x8,
// 		0x0,
// 		0x0,
// 		0x0,
// 		0x1,
// 		0x4,
// 		0x86,
// 		0x84,
// 		0x0,
// 		0x0,
// 		0x0,
// 		0x0,
// 	]);
// });

// test('parsing headers frame without headers', () => {
// 	const buffer: Buffer = Buffer.from([0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1]);

// 	const frame: HeadersFrame = new HeadersFrame(ByteBuffer.wrap(buffer));
// 	frame.read();

// 	expect(frame.getHeaders().size).toBe(0);
// });

// test('parsing headers frame with headers', () => {
// 	const buffer: Buffer = Buffer.from([0x0, 0x0, 0x2, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x86, 0x84]);

// 	const frame: HeadersFrame = new HeadersFrame(ByteBuffer.wrap(buffer));
// 	frame.read();

// 	expect(frame.getHeaders().get(':scheme')).toBe('http');
// 	expect(frame.getHeaders().get(':path')).toBe('/');
// });

// test('parsing headers frame with headers and padding', () => {
// 	const buffer: Buffer = Buffer.from([
// 		0x0,
// 		0x0,
// 		0x6,
// 		0x1,
// 		0x8,
// 		0x0,
// 		0x0,
// 		0x0,
// 		0x1,
// 		0x4,
// 		0x86,
// 		0x84,
// 		0x0,
// 		0x0,
// 		0x0,
// 		0x0,
// 	]);

// 	const frame: HeadersFrame = new HeadersFrame(ByteBuffer.wrap(buffer));
// 	frame.read();

// 	expect(frame.getHeaders().get(':scheme')).toBe('http');
// 	expect(frame.getHeaders().get(':path')).toBe('/');
// });
