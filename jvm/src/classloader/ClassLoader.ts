import {
	ClassInfo,
	Const,
	ConstantTag,
	FieldrefInfo,
	ParserState,
	StringInfo,
	Utf8Info,
	MethodrefInfo,
	NameAndTypeInfo,
} from './Types';
import * as fs from 'fs';

class ClassLoader {
	private state: ParserState;

	constructor() {
		this.state = { position: 0, buffer: undefined };
	}

	load(file: string) {
		const content: Buffer = fs.readFileSync(file);
		this.parse(content);
	}

	private parse(buffer: Buffer) {
		this.state = { position: 0, buffer };

		// .class files start with 4 magic bytes "CAFE"
		const cafebabe: string = this.readCAFEBABE();
		// then comes the minor version as a uint16
		const minorVersion: number = this.readUInt16();
		// then comes the major version as a uint16
		const majorVersion: number = this.readUInt16();

		console.log(`magic: ${cafebabe}\nminor version: ${minorVersion}\nmajor version: ${majorVersion}`);
		console.log(cafebabe, minorVersion, majorVersion);

		const constantPool: Const[] = this.readConstantPoolInfo();
		console.log(constantPool);
	}

	private readCAFEBABE(): string {
		let str: string = '';
		str += this.readUInt8().toString(16);
		str += this.readUInt8().toString(16);
		str += this.readUInt8().toString(16);
		str += this.readUInt8().toString(16);

		return str;
	}

	private readConstantPoolInfo(): Const[] {
		const constantPoolCount: number = this.readUInt16();
		console.log(`constant pool count: ${constantPoolCount}`);
		const pool: Const[] = [];

		for (let i = 0; i < constantPoolCount; i++) {
			const tag: ConstantTag = this.readUInt8();

			switch (tag) {
				case ConstantTag.UTF8:
					pool.push(this.readUtf8String());
					break;

				case ConstantTag.CLASS:
					pool.push(this.readClassInfo());
					break;

				case ConstantTag.STRING:
					pool.push(this.readStringInfo());
					break;

				case ConstantTag.FIELDREF:
					pool.push(this.readFieldref());
					break;

				case ConstantTag.METHODREF:
					pool.push(this.readMethodref());
					break;

				case ConstantTag.NAME_AND_TYPE:
					pool.push(this.readNameAndType());
					break;

				default:
					console.log('I dont support this type yet', tag);
					break;
			}
		}

		return pool;
	}

	private readNameAndType(): NameAndTypeInfo {
		return {
			nameIndex: this.readUInt16(),
			descriptorIndex: this.readUInt16(),
			tag: ConstantTag.NAME_AND_TYPE,
		};
	}

	private readMethodref(): MethodrefInfo {
		return {
			classIndex: this.readUInt16(),
			nameAndTypeIndex: this.readUInt16(),
			tag: ConstantTag.METHODREF,
		};
	}

	private readFieldref(): FieldrefInfo {
		return {
			classIndex: this.readUInt16(),
			nameAndTypeIndex: this.readUInt16(),
			tag: ConstantTag.FIELDREF,
		};
	}

	private readStringInfo(): StringInfo {
		return {
			stringIndex: this.readUInt16(),
			tag: ConstantTag.STRING,
		};
	}

	private readClassInfo(): ClassInfo {
		return {
			nameIndex: this.readUInt16(),
			tag: ConstantTag.CLASS,
		};
	}

	private readUtf8String(): Utf8Info {
		const length: number = this.readUInt16();

		let str: string = '';
		for (let i = 0; i < length; i++) {
			const pos: number = this.state.position + i;
			str += String.fromCharCode(this.state.buffer[pos]);
		}

		this.state.position += length;

		return { s: str, tag: ConstantTag.UTF8 };
	}

	private readUInt8(): number {
		return this.state.buffer.readUInt8(this.state.position++);
	}

	private readUInt16(): number {
		const retValue: number = this.state.buffer.readUInt16BE(this.state.position);
		this.state.position += 2;
		return retValue;
	}
}

export default ClassLoader;
