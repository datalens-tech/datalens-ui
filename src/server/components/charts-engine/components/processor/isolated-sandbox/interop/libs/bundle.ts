import fs from 'fs';
import path from 'path';

const bundlePrepare = fs.readFileSync(path.join(__dirname, '../bundle.js'), 'utf-8');

export {bundlePrepare};
