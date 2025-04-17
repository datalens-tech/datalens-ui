const {readFileSync} = require('fs');

const keysetFiles = process.argv.slice(2);
let hasErrors = false;

function readData(filePath) {
    return readFileSync(filePath).toString();
}

function getLangFromPath(filePath) {
    return filePath.split('/').at(-1).split('.')[0];
}

keysetFiles.forEach((filePath) => {
    const fileContent = readData(filePath);
    const lang = getLangFromPath(filePath);

    try {
        const keysets = JSON.parse(fileContent);
        const keys = Object.keys(keysets);
        const sortedKeys = [...keys].sort();

        if (keys.length !== sortedKeys.length) {
            throw Error(`Different number of keys in ${lang} for keyset ${filePath}`);
        }

        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== sortedKeys[i]) {
                throw Error(`Keyset missmatch for ${lang} for keyset ${filePath}`);
            }
        }
    } catch (e) {
        console.error(e);
        hasErrors = true;
    }
});

process.exitCode = hasErrors ? 1 : 0;
