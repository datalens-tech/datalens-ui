import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import {KEYSET_LANGUAGES} from './constants';

function getContentHash(content: string) {
    const hash = crypto.createHash('md5');
    hash.update(content);
    return hash.digest('hex');
}

export function getJSFileName(name: string, fileContent: string) {
    const hash = `.${getContentHash(fileContent).slice(0, 8)}`;
    return `${name}${hash}.js`;
}

export async function clearFiles(destPath: string) {
    await fs.promises.rm(destPath, {recursive: true, force: true});
    await fs.promises.mkdir(destPath, {recursive: true});
}

export function umdTemplate(content: string, globalVar: string) {
    return `
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.${globalVar} = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
    return ${content};
}));
`.trim();
}

export async function listKeysetDirNames(keysetsDir: string) {
    const result: string[] = [];
    const directories = await fs.promises.readdir(keysetsDir, {withFileTypes: true});

    for (const dir of directories) {
        if (!dir.isDirectory() || dir.name.startsWith('.')) {
            continue;
        }
        result.push(dir.name);
    }
    return result;
}

export async function loadJson(dirname: string, filename: string) {
    const fullname = path.resolve(dirname, filename);
    const content = await fs.promises.readFile(fullname, {
        encoding: 'utf-8',
    });
    try {
        return JSON.parse(content) as Record<string, unknown>;
    } catch (error) {
        throw new Error('Failed to load json file');
    }
}

export type KeysetsWithLangs = {
    [lang in string]: {
        [name in string]: {
            content: Record<string, unknown>;
        };
    };
};

export async function getKeysets(keysetsDir: string) {
    const keysets = KEYSET_LANGUAGES.reduce<KeysetsWithLangs>((acc, lang) => {
        acc[lang] = {};
        return acc;
    }, {});

    for (const keysetDirName of await listKeysetDirNames(keysetsDir)) {
        const keysetDir = path.resolve(keysetsDir, keysetDirName);
        const keysetDirFiles = await fs.promises.readdir(keysetDir, {withFileTypes: true});

        for (const file of keysetDirFiles) {
            if (!file.isFile()) {
                continue;
            }

            for (const lang of KEYSET_LANGUAGES) {
                if (`${lang}.json` === file.name) {
                    const content = await loadJson(keysetDir, file.name);
                    keysets[lang][keysetDirName] = {
                        content,
                    };
                }
            }
        }
    }
    return keysets;
}

export type KeysetData = {
    filename: string;
    keyset: Record<string, Record<string, unknown>>;
};

export function prepareKeysetData({
    lang,
    keysets,
    typeFileName,
}: {
    lang: string;
    keysets: KeysetsWithLangs;
    typeFileName?: string;
}): KeysetData[] {
    const keyset: KeysetData['keyset'] = {};
    const langKeysets = keysets[lang];
    Object.keys(langKeysets).forEach((key) => {
        keyset[key] = langKeysets[key].content;
    });
    const result: KeysetData[] = [
        {
            filename: lang,
            keyset,
        },
    ];

    if (typeFileName) {
        const typeFileContent: KeysetData['keyset'] = {};
        Object.keys(keyset).forEach((keysetName) => {
            typeFileContent[keysetName] = Object.keys(keyset[keysetName]).reduce<
                Record<string, string>
            >((acc, key) => {
                acc[key] = 'str';
                return acc;
            }, {});
        });
        result.push({
            filename: typeFileName,
            keyset: typeFileContent,
        });
    }

    return result;
}
