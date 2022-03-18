import ClassLoader from './classloader/ClassLoader';
import * as path from 'path';

console.log('Hello world');

const loader: ClassLoader = new ClassLoader();
loader.load(path.resolve('./juho/Main.class'));
