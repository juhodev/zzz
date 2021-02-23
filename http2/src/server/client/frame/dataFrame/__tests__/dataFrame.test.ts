// import Flags from '../../flags';
// import DataFrame from '../dataFrame';
// import { DataFrameFlags } from '../types';

// test('create a basic data frame', () => {
// 	const dataFrame: DataFrame = new DataFrame();
// 	dataFrame.createDataFrame(Buffer.from('test'), 1, new Flags());

// 	const buffer: Buffer = dataFrame.toBuffer();

// 	expect([...buffer]).toStrictEqual([0x0, 0x0, 0x4, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x74, 0x65, 0x73, 0x74]);
// });

// test('create a data frame with padding', () => {
// 	const dataFrame: DataFrame = new DataFrame();
// 	dataFrame.createDataFrame(Buffer.from('test'), 1, new Flags().add({ flag: DataFrameFlags.PADDED, data: 4 }));

// 	const buffer: Buffer = dataFrame.toBuffer();
// 	console.log(buffer);
// 	expect([...buffer]).toStrictEqual([
// 		0x0,
// 		0x0,
// 		0x8,
// 		0x0,
// 		0x8,
// 		0x0,
// 		0x0,
// 		0x0,
// 		0x1,
// 		0x4,
// 		0x74,
// 		0x65,
// 		0x73,
// 		0x74,
// 		0x0,
// 		0x0,
// 		0x0,
// 		0x0,
// 	]);
// });
