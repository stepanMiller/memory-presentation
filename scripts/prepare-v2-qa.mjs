import {cp} from 'node:fs/promises';
await cp(new URL('../tests/v2-review.html',import.meta.url),new URL('../dist/__qa.html',import.meta.url));
await cp(new URL('../tests/v2-layout-check.js',import.meta.url),new URL('../dist/__qa.js',import.meta.url));
console.log('Local QA page prepared: __qa.html. The production build omits it.');
