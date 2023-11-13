import type {Point} from 'highcharts';

import {ActionParams, isPointSelected} from './utils';

describe('isPointSelected', () => {
    const point = {options: {custom: {actionParams: {a: 1, b: 2}}}} as unknown as Point;

    test('empty actionParams -> point is not selected', () => {
        const actionParams = {};
        expect(isPointSelected(point, actionParams)).toBeFalsy();
    });

    test('point data has no intersections with the actionParams -> point is not selected', () => {
        const actionParams: ActionParams = {c: ['3']};
        expect(isPointSelected(point, actionParams)).toBeFalsy();
    });

    test('point data has partial match with the actionParams -> point is selected', () => {
        const actionParams: ActionParams = {a: ['1']};
        expect(isPointSelected(point, actionParams)).toBeTruthy();
    });

    test('point data has full match with the actionParams -> point is selected', () => {
        const actionParams: ActionParams = {a: [1], b: ['2']};
        expect(isPointSelected(point, actionParams)).toBeTruthy();
    });

    test('point data has full match with the actionParams(multiselect) -> point is selected', () => {
        const actionParams: ActionParams = {a: [1, 7], b: ['2']};
        expect(isPointSelected(point, actionParams)).toBeTruthy();
    });

    test('point data and actionParams have parameters with different values -> point is not selected', () => {
        const actionParams: ActionParams = {a: ['2']};
        expect(isPointSelected(point, actionParams)).toBeFalsy();
    });
});
