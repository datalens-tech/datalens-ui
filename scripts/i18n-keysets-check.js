/**
 * Weblate can’t create keyset, that is why we need to create new keysets in all languages
 * That's why we need to decrease diff
 */

const {spawnSync} = require('child_process');
const {readFileSync, writeFileSync} = require('fs');
const {join, parse} = require('path');

const LANGUAGES = ['ru', 'en'];

const trimValue = (value) => {
    if (typeof value === 'string') {
        return value.trim();
    }
    if (Array.isArray(value)) {
        return value.map((v) => (typeof v === 'string' ? v.trim() : v));
    }
    return value;
};

const getPairedLanguageKeysets = (filePath) => {
    const parsedData = parse(filePath);

    return LANGUAGES.reduce((memo, lang) => {
        if (lang !== parsedData.name) {
            memo[lang] = join(parsedData.dir, `${lang}${parsedData['ext']}`);
        }

        return memo;
    }, {});
};

const readData = (filePath) => readFileSync(filePath).toString();

const readPairedKeysetsKeys = (filePath) =>
    Object.entries(getPairedLanguageKeysets(filePath)).reduce((memo, [lang, file]) => {
        try {
            memo[lang] = Object.keys(JSON.parse(readData(file))).sort();
        } catch (e) {
            throw new Error(`${file} read error: ${e.message}`);
        }

        return memo;
    }, {});

const keysetFiles = process.argv.slice(2);
keysetFiles.forEach((filePath) => {
    const fileContent = readData(filePath);

    try {
        const keysets = JSON.parse(fileContent);
        const res = {};
        const sortedKeys = Object.keys(keysets).sort();
        const pairedKeysets = readPairedKeysetsKeys(filePath);

        sortedKeys.forEach((key) => {
            res[key] = trimValue(keysets[key]);
        });

        Object.entries(pairedKeysets).forEach(([lang, keys]) => {
            const keysLength = keys.length;

            if (sortedKeys.length !== keysLength) {
                throw Error(`Different number of keys in ${lang} for keyset ${filePath}`);
            }

            for (let i = 0; i < keysLength; i++) {
                if (keys[i] !== sortedKeys[i]) {
                    throw Error(`Keyset missmatch for ${lang} for keyset ${filePath}`);
                }
            }
        });

        writeFileSync(filePath, `${JSON.stringify(res, null, 2)}\n`);

        spawnSync('git', ['add', filePath]);
        process.exitCode = 0;
    } catch (e) {
        console.error(e);
        process.exitCode = 1;
    }
});
