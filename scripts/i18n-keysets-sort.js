/**
 * Weblate create PR with changed and approved keysets with sorted keys
 * That's why we need to decrease diff
 */
const {spawnSync} = require('child_process');
const {readFileSync, writeFileSync} = require('fs');
const changedUncommittedFiles = spawnSync('git', ['status', '-s']);

const needSortFiles =
    changedUncommittedFiles.output?.[1] && changedUncommittedFiles.output?.[1].length;
if (!needSortFiles) {
    process.exitCode = 0;
}
const filesList = changedUncommittedFiles.output[1].toString();
const filteredFiles = filesList
    .split('\n')
    .filter((item) => {
        const hasKeysetFiles = item.trim().match(/(A|M)\s*(src\/i18n-keysets\/).*\.json/);
        if (!hasKeysetFiles) {
            return false;
        }
        const fileName = item.split('/').pop();
        return fileName !== 'context.json' && fileName !== 'keyset.json';
    })
    .map((item) => item.split(' ').pop());

filteredFiles.forEach((filePath) => {
    const fileContent = readFileSync(filePath).toString();
    try {
        const keysets = JSON.parse(fileContent);
        const res = {};
        Object.keys(keysets)
            .sort()
            .forEach((key) => {
                res[key] = keysets[key];
            });
        writeFileSync(filePath, JSON.stringify(res, null, 4));

        spawnSync('git', ['add', filePath]);
    } catch (e) {
        process.exitCode = 1;
    }
});

process.exitCode = 0;
