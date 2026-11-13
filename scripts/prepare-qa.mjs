import {copyFile} from 'node:fs/promises';
await copyFile(new URL('../tests/review.html',import.meta.url),new URL('../dist/review.html',import.meta.url));
await copyFile(new URL('../tests/layout-check.js',import.meta.url),new URL('../dist/layout-check.js',import.meta.url));
console.log('Local QA harness: /review.html. Exclude it from publication.');
