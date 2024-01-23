/**
 * Weblate create PR with changed and approved keysets with sorted keys
 * That's why we need to decrease diff
 */

const {spawnSync} = require('child_process');
const {readFileSync, writeFileSync} = require('fs');

const keysetFiles = process.argv.slice(2);
keysetFiles.forEach((filePath) => {
    const fileContent = readFileSync(filePath).toString();
    try {
        const keysets = JSON.parse(fileContent);
        const res = {};
        Object.keys(keysets)
            .sort()
            .forEach((key) => {
                res[key] = keysets[key];
            });
        writeFileSync(filePath, JSON.stringify(res, null, 2));

        spawnSync('git', ['add', filePath]);
        process.exitCode = 0;
    } catch (e) {
        console.error(e);
        process.exitCode = 1;
    }
});
