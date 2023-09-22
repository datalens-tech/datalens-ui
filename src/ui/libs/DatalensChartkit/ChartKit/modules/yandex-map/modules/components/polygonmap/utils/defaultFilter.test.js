import defaultFilter from './defaultFilter';

describe('defaultFilter', () => {
    describe('given that the feature contains points', () => {
        it('will return true', () => {
            const output = defaultFilter({
                type: 'Feature',
                properties: {
                    pointsCount: 10,
                },
            });
            expect(output).toBe(true);
        });
    });

    describe('given that the feature not contains points', () => {
        it('will return false', () => {
            const output = defaultFilter({
                type: 'Feature',
                properties: {
                    pointsCount: 0,
                },
            });
            expect(output).toBe(false);
        });
    });
});
