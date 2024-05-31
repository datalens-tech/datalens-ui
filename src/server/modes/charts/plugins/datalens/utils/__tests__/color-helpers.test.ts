import type {ChartColorsConfig} from '../../types';
import {mapAndColorizeHashTableByGradient} from '../color-helpers';

describe('mapAndColorizeHashTableByGradient', () => {
    const colorConfig = {
        gradientColors: ['#ffffff', '#888888', '#000000'],
        gradientMode: '3-point',
    } as ChartColorsConfig;

    it('hashTable with number values', () => {
        const hashTable = {
            polygon_0_0: 10,
            polygon_1_0: 0,
            polygon_2_0: 100,
            polygon_3_0: 110,
        };

        let result = mapAndColorizeHashTableByGradient(hashTable, colorConfig);
        result = JSON.parse(JSON.stringify(result).replace(/(\\n +)/g, ''));

        expect(result).toEqual({
            colorData: {
                polygon_0_0: {backgroundColor: 'rgb(244, 244, 244)', color: '#FFF', value: 10},
                polygon_1_0: {backgroundColor: 'rgb(255, 255, 255)', color: '#FFF', value: 0},
                polygon_2_0: {backgroundColor: 'rgb(80, 80, 80)', color: '#FFF', value: 100},
                polygon_3_0: {backgroundColor: 'rgb(0, 0, 0)', color: '#FFF', value: 110},
            },
            min: 0,
            mid: 55,
            max: 110,
        });
    });

    it('hashTable with string values', () => {
        const hashTable = {};

        Object.assign(hashTable, {
            polygon_0_0: '10.0',
            polygon_1_0: '0',
            polygon_2_0: '100.0',
            polygon_3_0: '110.0',
        });

        let result = mapAndColorizeHashTableByGradient(hashTable, colorConfig);
        result = JSON.parse(JSON.stringify(result).replace(/(\\n +)/g, ''));

        expect(result).toEqual({
            colorData: {
                polygon_0_0: {backgroundColor: 'rgb(244, 244, 244)', color: '#FFF', value: 10},
                polygon_1_0: {backgroundColor: 'rgb(255, 255, 255)', color: '#FFF', value: 0},
                polygon_2_0: {backgroundColor: 'rgb(80, 80, 80)', color: '#FFF', value: 100},
                polygon_3_0: {backgroundColor: 'rgb(0, 0, 0)', color: '#FFF', value: 110},
            },
            min: 0,
            mid: 55,
            max: 110,
        });
    });
});
