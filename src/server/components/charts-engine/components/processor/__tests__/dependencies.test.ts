import {extractDependencies} from '../dependencies';

describe('extract dependencies from code', () => {
    test('success', () => {
        const params = {
            code: `
            const scripts = require('Users/_/-/@/Fizz & Buzz/module');
            /** some comments **/
            // require('Users/old/module')
            module.exports = [];
`,
        };
        const modules = extractDependencies(params);
        expect(modules).toStrictEqual(['users/_/-/@/fizz & buzz/module']);
    });
});
