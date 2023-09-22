const path = require('path');

// https://jestjs.io/docs/code-transformation#examples

module.exports = {
    process(_sourceText, sourcePath) {
        return {
            code: `module.exports = ${JSON.stringify(path.basename(sourcePath))};`,
        };
    },
};
