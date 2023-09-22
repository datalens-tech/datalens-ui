import defaultMapper from './defaultMapper';

const polygonmapMock = {
    colorize: {
        getColor: () => 'rgba(255,255,255,1)',
    },
    options: {
        get() {},
    },
};

describe('defaultMapper', () => {
    describe('given that the feature contains something intresting', () => {
        const output = defaultMapper.bind(polygonmapMock)({
            type: 'Feature',
            geometry: {
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
                ],
            },
            properties: {
                pointsCount: 10,
                pointsCountMaximum: 100,
            },
        });

        it("will contains field type equals 'Feature'", () => {
            expect(output).toEqual(
                expect.objectContaining({
                    type: 'Feature',
                }),
            );
        });

        it('will contains field fillColor in options', () => {
            // expect(output.options).to.have.own.property('fillColor');
            expect(output.options).toEqual(
                expect.objectContaining({
                    fillColor: expect.any(String),
                }),
            );
        });
    });
});
