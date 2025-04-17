/**
 * Because of moving to Weblate we don't need keyset.json & context.json files
 */

const keysetFiles = process.argv.slice(2);
if (keysetFiles.length) {
    console.error(
        `It it prohibited to add keyset.json and context.json files:\n\n${keysetFiles.join('\n')}`,
    );
    process.exitCode = 1;
} else {
    process.exitCode = 0;
}
