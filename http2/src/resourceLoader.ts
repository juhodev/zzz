import { Resource, ResourceType } from './server/types';
import * as path from 'path';
import * as fs from 'fs';
import { isNil } from './utilts';

export function loadResource(resourceName: string): Resource {
	if (resourceName === '/') {
		resourceName = 'index.html';
	} else {
		resourceName = resourceName.substr(1, resourceName.length);
	}

	const resourcePath: string = path.resolve('dist', resourceName);
	if (!fs.existsSync(resourcePath)) {
		return undefined;
	}

	let resourceType: ResourceType = undefined;

	const supportedFileTypes: ResourceType[] = [
		{ ending: '.html', contentType: 'text/html' },
		{ ending: '.txt', contentType: 'text/plain' },
		{ ending: '.js', contentType: 'text/javascript' },
	];
	for (const fileType of supportedFileTypes) {
		if (resourceName.toLowerCase().endsWith(fileType.ending)) {
			resourceType = fileType;
			break;
		}
	}

	if (isNil(resourceType)) {
		return undefined;
	}

	const content: string = fs.readFileSync(resourcePath, 'utf-8');
	return { contentType: resourceType.contentType, content };
}
