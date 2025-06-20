import {isFloat, isInt, isParameterNameValid, isUInt} from '../validation';

describe('isParameterNameValid', () => {
    it('the parameter should not start with _ or __', () => {
        const parameterNames = ['_parameter', '__parameter'];
        const expectedValidation = [false, false];
        const results = parameterNames.map(isParameterNameValid);
        expect(results).toEqual(expectedValidation);
    });

    it('parameter length should not exceed 36 characters', () => {
        const longParameterName = '1234567890asdfghzxcvbn!@#$%^&*_-QWERTY';
        const result = isParameterNameValid(longParameterName);
        expect(result).toEqual(false);
    });

    it('parameter should not contain technical values tab, state, mode, focus, grid, tz, from, to', () => {
        const techParameterNames = ['tab', 'state', 'mode', 'focus', 'grid', 'tz', 'from', 'to'];
        const expectedValidation = new Array(8).fill(false);
        const results = techParameterNames.map(isParameterNameValid);
        expect(results).toEqual(expectedValidation);
    });

    it('parameter should not contain special characters', () => {
        const parameterNamesWithSpecialSymbols = [
            'asd!',
            'asd@',
            'asd#',
            'asd$',
            'asd%',
            'asd^',
            'asd&',
            'asd*',
            'asd(',
            'asd)',
            'asd"',
            'asd;',
            'asd{',
            'asd}',
            'asd:',
            'asd<',
            'asd>',
            'asd`',
            'asd|',
            'asd\\',
            'asd?',
            'asd[',
            'asd]',
            'asd~',
            'asd+',
        ];
        const expectedValidation = new Array(parameterNamesWithSpecialSymbols.length).fill(false);
        const results = parameterNamesWithSpecialSymbols.map(isParameterNameValid);
        expect(results).toEqual(expectedValidation);
    });

    it('return true, if parameter does not have invalid values', () => {
        const validParameterName = '123456789qwe_QWE-';
        const result = isParameterNameValid(validParameterName);
        expect(result).toEqual(true);
    });

    it('parameter should contain ascii in name', () => {
        const parameterName = '±';
        const result = isParameterNameValid(parameterName);
        expect(result).toEqual(false);
    });

    it('should pass the validation, If the reserved word is part of the name', () => {
        const parameterName = 'tab_parameter';
        const result = isParameterNameValid(parameterName);
        expect(result).toEqual(true);
    });
});

describe('isInt', () => {
    it.each([
        ['123', true],
        ['0', true],
        ['-123', true],
        ['123.0', true],
        ['-123.0', true],
        ['123.5', false],
        ['abc', false],
        ['12.34', false],
        ['', false],
        ['123abc', false],
        [123, true],
        [0, true],
        [-123, true],
        [123.0, true],
        [-123.0, true],
        [123.5, false],
        [Number.MAX_SAFE_INTEGER, true],
        [Number.MAX_SAFE_INTEGER + 1, false],
    ])('should return %s for input %s', (input, expected) => {
        expect(isInt(input)).toBe(expected);
    });
});

describe('isUInt', () => {
    it.each([
        ['123', true],
        ['0', true],
        ['123.0', true],
        ['-123', false],
        ['-123.0', false],
        ['123.5', false],
        ['abc', false],
        ['12.34', false],
        ['', false],
        ['123abc', false],
        [123, true],
        [0, true],
        [123.0, true],
        [-123, false],
        [-123.0, false],
        [123.5, false],
        [Number.MAX_SAFE_INTEGER, true],
        [Number.MAX_SAFE_INTEGER + 1, false],
    ])('should return %s for input %s', (input, expected) => {
        expect(isUInt(input)).toBe(expected);
    });
});

describe('isFloat', () => {
    it.each([
        ['123', true],
        ['0', true],
        ['-123', true],
        ['123.5', true],
        ['-123.5', true],
        ['0.5', true],
        ['-0.5', true],
        ['123.0', true],
        ['-123.0', true],
        ['abc', false],
        ['', false],
        ['123abc', false],
        ['12.34.56', false],
        [123, true],
        [0, true],
        [-123, true],
        [123.5, true],
        [-123.5, true],
        [0.5, true],
        [-0.5, true],
        [123.0, true],
        [-123.0, true],
        [Infinity, false],
        [-Infinity, false],
        [NaN, false],
        [Number.MAX_SAFE_INTEGER, true],
        [Number.MIN_SAFE_INTEGER, true],
        [Number.MAX_SAFE_INTEGER + 1, false],
        [Number.MIN_SAFE_INTEGER - 1, false],
    ])('should return %s for input %s', (input, expected) => {
        expect(isFloat(input)).toBe(expected);
    });
});
