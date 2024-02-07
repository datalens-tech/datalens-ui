import {isNumericCSSValueValid} from './utils';

describe('ui/components/Markup', () => {
    test.each([
        {args: {value: 15}, expected: true},
        {args: {value: '15px'}, expected: true},
        {args: {value: '15em', availableDimensions: ['em']}, expected: true},
        {args: {value: '15%', availableDimensions: ['%']}, expected: true},
        {args: {value: undefined}, expected: false},
        {args: {value: '15'}, expected: false},
        {args: {value: '15%'}, expected: false},
        {args: {value: 'str'}, expected: false},
    ])('isNumericCSSValueValid (args: %j)', ({args, expected}) => {
        const {value, availableDimensions} = args;
        const result = isNumericCSSValueValid(value, availableDimensions);
        expect(result).toBe(expected);
    });
});
