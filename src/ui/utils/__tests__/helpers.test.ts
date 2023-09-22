import {getFilteredObject} from '../helpers';

describe('helpers/getFilteredObject', () => {
    const obj: any = {a: 1, b: 2};

    it('should not mutated source object', () => {
        const clonedObj = getFilteredObject(obj, ['a']);
        expect(obj).not.toEqual(clonedObj);
    });

    it('try to remove fields that do not exist', () => {
        const clonedObj = getFilteredObject(obj, ['c.d', 'f']);
        expect(obj).toEqual(clonedObj);
    });
});
