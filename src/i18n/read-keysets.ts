import fs from 'fs';

interface KeysetFile {
    filename: string;
}

export function readKeysets(destination: string) {
    const files = fs.readdirSync(destination);

    return files.reduce(
        (acc: Record<string, KeysetFile>, filename) => {
            const match = filename.match(/(\.(\d|\w)+)?\.js$/); // trying to find {hash}?.js

            if (!match) {
                return acc;
            }

            acc[filename.slice(0, match.index)] = {
                filename,
            };

            return acc;
        },
        {} as Record<string, KeysetFile>,
    );
}
