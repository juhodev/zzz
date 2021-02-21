export type RequestData = {
	method: string;
	resource: string;
	protocol: string;
	headers: Map<string, string>;
};

export type ResourceType = {
	ending: string;
	contentType: string;
};

export type Resource = {
	content: string;
	contentType: string;
};

export type Header = {
	key: string;
	value: string;
};
