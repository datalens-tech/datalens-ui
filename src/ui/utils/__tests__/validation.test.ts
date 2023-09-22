import {validateParameterName} from '../validation';

describe('validateParameterName', () => {
    it('the parameter should not start with _ or __', () => {
        const parameterNames = ['_parameter', '__parameter'];
        const expectedValidation = [false, false];
        const results = parameterNames.map(validateParameterName);
        expect(results).toEqual(expectedValidation);
    });

    it('parameter length should not exceed 36 characters', () => {
        const longParameterName = '1234567890asdfghzxcvbn!@#$%^&*_-QWERTY';
        const result = validateParameterName(longParameterName);
        expect(result).toEqual(false);
    });

    it('parameter should not contain technical values tab, state, mode, focus, grid, tz, from, to', () => {
        const techParameterNames = ['tab', 'state', 'mode', 'focus', 'grid', 'tz', 'from', 'to'];
        const expectedValidation = new Array(8).fill(false);
        const results = techParameterNames.map(validateParameterName);
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
        const results = parameterNamesWithSpecialSymbols.map(validateParameterName);
        expect(results).toEqual(expectedValidation);
    });

    it('return true, if parameter does not have invalid values', () => {
        const validParameterName = '123456789qwe_QWE-';
        const result = validateParameterName(validParameterName);
        expect(result).toEqual(true);
    });

    it('parameter should contain ascii in name', () => {
        const parameterName = '±';
        const result = validateParameterName(parameterName);
        expect(result).toEqual(false);
    });

    it('should pass the validation, If the reserved word is part of the name', () => {
        const parameterName = 'tab_parameter';
        const result = validateParameterName(parameterName);
        expect(result).toEqual(true);
    });
});
