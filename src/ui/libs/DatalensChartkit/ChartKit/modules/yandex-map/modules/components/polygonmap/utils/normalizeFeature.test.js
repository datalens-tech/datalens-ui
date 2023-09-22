import normalizeFeature from './normalizeFeature';

describe('normalizeFeature', () => {
    describe('for MultiPolygon type of geometry', () => {
        const output = normalizeFeature({
            type: 'Feature',
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [
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
                    ],
                    [
                        [
                            [37.68, 55.78],
                            [37.68, 55.79],
                            [37.69, 55.79],
                            [37.69, 55.78],
                            [37.68, 55.78],
                        ],
                    ],
                ],
            },
        });

        it('will change MultiPolygon to Polygon type of geometry', () => {
            expect(output.geometry.type).toBe('Polygon');
        });

        it('will flat coordinates array', () => {
            expect(output.geometry.coordinates).toHaveLength(3);
            expect(output.geometry.coordinates[0]).toHaveLength(5);
            expect(output.geometry.coordinates[0][0]).toHaveLength(2);
            expect(typeof output.geometry.coordinates[0][0][0]).toBe('number');
        });
    });

    describe('for other type of geometry', () => {
        const output = normalizeFeature({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [37.64, 55.76],
            },
        });

        it('will save original type of geometry', () => {
            expect(output.geometry.type).toBe('Point');
            expect(output.geometry).toEqual(
                expect.objectContaining({
                    type: 'Point',
                    fillRule: 'evenOdd',
                }),
            );
        });
    });
});
