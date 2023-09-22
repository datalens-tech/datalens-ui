import {getColorShapeMappingValue} from '../helpers';

describe('getColorShapeMappingValue', () => {
    const args = {shownTitle: 'field-1 [Group]', colorAndShapeKey: 'field-1'};
    const keys = ['shownTitle', 'colorAndShapeKey'] as ['shownTitle', 'colorAndShapeKey'];
    it.each(keys)(
        'should return %s when mountedValues contains non auto value with that key',
        (key) => {
            const mountedValues = {
                [args[key]]: 'red',
            };

            const {shownTitle, colorAndShapeKey} = args;

            const result = getColorShapeMappingValue({mountedValues, shownTitle, colorAndShapeKey});

            expect(result).toEqual(args[key]);
        },
    );

    it.each(keys)('should return undefined when mountedValue is auto (%s)', (key) => {
        const mountedValues = {
            [args[key]]: 'auto',
        };

        const {shownTitle, colorAndShapeKey} = args;

        const result = getColorShapeMappingValue({mountedValues, shownTitle, colorAndShapeKey});

        expect(result).toEqual(undefined);
    });

    it.each(['shownTitle', 'colorAndShapeKey'])(
        "should return undefined when mountedValues doesn't contains the key (%s)",
        () => {
            const mountedValues = {};

            const {shownTitle, colorAndShapeKey} = args;

            const result = getColorShapeMappingValue({mountedValues, shownTitle, colorAndShapeKey});

            expect(result).toEqual(undefined);
        },
    );
});
