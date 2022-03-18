export type Const =
	| ClassInfo
	| FieldrefInfo
	| MethodrefInfo
	| InterfaceMethodrefInfo
	| StringInfo
	| IntegerInfo
	| FloatInfo
	| LongInfo
	| DoubleInfo
	| NameAndTypeInfo
	| Utf8Info
	| MethodHandleInfo;

export type ParserState = {
	position: number;
	buffer: Buffer;
};

export type ClassInfo = {
	tag: ConstantTag.CLASS;
	nameIndex: number;
};

export type FieldrefInfo = {
	tag: ConstantTag.FIELDREF;
	classIndex: number;
	nameAndTypeIndex: number;
};

export type MethodrefInfo = {
	tag: ConstantTag.METHODREF;
	classIndex: number;
	nameAndTypeIndex: number;
};

export type InterfaceMethodrefInfo = {
	tag: ConstantTag.INTERFACE_METHODREF;
	classIndex: number;
	nameAndTypeIndex: number;
};

export type StringInfo = {
	tag: ConstantTag.STRING;
	stringIndex: number;
};

export type IntegerInfo = {
	tag: ConstantTag.INTEGER;
	bytes: Buffer;
};

export type FloatInfo = {
	tag: ConstantTag.FLOAT;
	bytes: Buffer;
};

export type LongInfo = {
	tag: ConstantTag.LONG;
	highBytes: Buffer;
	lowBytes: Buffer;
};

export type DoubleInfo = {
	tag: ConstantTag.DOUBLE;
	highBytes: Buffer;
	lowBytes: Buffer;
};

export type NameAndTypeInfo = {
	tag: ConstantTag.NAME_AND_TYPE;
	nameIndex: number;
	descriptorIndex: number;
};

export type Utf8Info = {
	tag: ConstantTag.UTF8;
	s: string;
};

export type MethodHandleInfo = {
	tag: ConstantTag.METHOD_HANDLE;
	referenceKind: number;
	referenceIndex: number;
};

export enum ConstantTag {
	UTF8 = 1,
	INTEGER = 3,
	FLOAT = 4,
	LONG = 5,
	DOUBLE = 6,
	CLASS = 7,
	STRING = 8,
	FIELDREF = 9,
	METHODREF = 10,
	INTERFACE_METHODREF = 11,
	NAME_AND_TYPE = 12,
	METHOD_HANDLE = 15,
}
