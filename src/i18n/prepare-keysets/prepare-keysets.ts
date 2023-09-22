import fs from 'fs';
import path from 'path';

import {GLOBAL_I18N_VAR, I18N_DEST_PATH, I18N_TYPES_FILE} from '../constants';

import {KEYSET_LANGUAGES, LANG_FOR_TYPES} from './constants';
import {clearFiles, getJSFileName, getKeysets, prepareKeysetData, umdTemplate} from './utils';

export const prepareKeysets = async (keysetsDir: string) => {
    await clearFiles(I18N_DEST_PATH);

    const keysets = await getKeysets(keysetsDir);
    const writePromises = [];

    for (const lang of KEYSET_LANGUAGES) {
        const typeFileName = lang === LANG_FOR_TYPES ? I18N_TYPES_FILE : undefined;
        const keysetData = prepareKeysetData({lang, keysets, typeFileName});

        for (const dataItem of keysetData) {
            const JSONContent = JSON.stringify(dataItem.keyset, null, 4);

            if (dataItem.filename === I18N_TYPES_FILE) {
                writePromises.push({
                    filename: dataItem.filename,
                    promise: fs.promises.writeFile(
                        path.resolve(I18N_DEST_PATH, dataItem.filename),
                        JSONContent,
                        {encoding: 'utf-8'},
                    ),
                });
            } else {
                const content = umdTemplate(JSONContent, GLOBAL_I18N_VAR);
                const JSFileName = getJSFileName(dataItem.filename, JSONContent);

                writePromises.push({
                    filename: JSFileName,
                    promise: fs.promises.writeFile(
                        path.resolve(I18N_DEST_PATH, JSFileName),
                        content,
                        {encoding: 'utf-8'},
                    ),
                });
            }
        }
    }

    await Promise.all(writePromises.map(({promise}) => promise));
};
