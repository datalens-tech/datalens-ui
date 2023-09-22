import inside from './inside';

describe('inside', () => {
    let output;
    let input0;
    let inputs1;
    let i = 0;

    beforeEach(() => {
        input0 = {
            type: 'Polygon',
            coordinates: [
                [
                    [37.6, 55.7],
                    [37.7, 55.7],
                    [37.7, 55.8],
                    [37.6, 55.8],
                    [37.6, 55.7],
                ],
                [
                    [37.61, 55.72],
                    [37.61, 55.74],
                    [37.63, 55.74],
                    [37.63, 55.72],
                    [37.61, 55.72],
                ],
                [
                    [37.68, 55.78],
                    [37.68, 55.79],
                    [37.69, 55.79],
                    [37.69, 55.78],
                    [37.68, 55.78],
                ],
            ],
        };
        inputs1 = [
            {type: 'Point', coordinates: [37.64, 55.76]},
            {type: 'Point', coordinates: [37.6, 55.7]},
            {type: 'Point', coordinates: [37.0, 55.0]},
            {type: 'Point', coordinates: [37.62, 55.73]},
        ];
        output = inside(input0, inputs1[i]);
        i++;
    });

    describe('should return boolean', () => {
        it('should return true if point is inside polygon', () => {
            expect(output).toBe(true);
        });

        it('should return true if point is on border', () => {
            expect(output).toBe(true);
        });

        it('should return false if point is outside', () => {
            expect(output).toBe(false);
        });

        it('should return false if point is inside hole', () => {
            expect(output).toBe(false);
        });
    });
});
