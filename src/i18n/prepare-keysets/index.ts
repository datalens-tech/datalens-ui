import fs from 'fs';
import path from 'path';

import {I18N_DEST_PATH, I18N_TYPES_FILE, I18N_TYPES_PATH} from '../constants';

import {prepareKeysets} from './prepare-keysets';

const prepare = async () => {
    await prepareKeysets('src/i18n-keysets');

    await fs.promises.mkdir(I18N_TYPES_PATH, {recursive: true});
    await fs.promises.copyFile(
        path.join(I18N_DEST_PATH, I18N_TYPES_FILE),
        path.join(I18N_TYPES_PATH, I18N_TYPES_FILE),
    );
};

prepare().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err.stack || err);
    process.exit(1);
});
