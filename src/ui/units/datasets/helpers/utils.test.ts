import {isCreationProcess} from './utils';

describe('dataset/helpers/isCreationProcess', () => {
    test.each([
        ['', false],
        ['/datasets/name', false],
        ['/datasets/name-new', false],
        ['/datasets/new-name', false],
        ['/datasets/new', true],
    ])('isCreationProcess (args: %j)', (pathname, expected) => {
        const result = isCreationProcess(pathname);
        expect(result).toEqual(expected);
    });
});
