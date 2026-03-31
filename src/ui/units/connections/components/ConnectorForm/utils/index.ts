import {isEqual} from 'lodash';
import type {BaseItem, Row} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import type {ConnectionsReduxState} from '../../../store';
import type {FormDict} from '../../../typings';

const checkDependencies = (
    form: ConnectionsReduxState['form'] | ConnectionsReduxState['innerForm'],
    displayConditions: NonNullable<BaseItem['displayConditions']>,
) => {
    return Object.entries(displayConditions).every(([key, value]) => {
        const formValue = form[key];
        return formValue === undefined ? true : formValue === value;
    });
};

// TODO: add unit test [CHARTS-5033]
export const canBeRendered = ({
    form,
    innerForm = {},
    displayConditions,
}: {
    form: ConnectionsReduxState['form'];
    innerForm: ConnectionsReduxState['innerForm'];
    displayConditions?: BaseItem['displayConditions'];
}) => {
    if (!displayConditions) {
        return true;
    }

    return (
        checkDependencies(form, displayConditions) &&
        checkDependencies(innerForm, displayConditions)
    );
};

export const getCollapsesToExpand = (rows: Row[], errorNames: string[]): FormDict => {
    const collapseNames = new Set<string>();
    for (const row of rows) {
        if ('type' in row && row.type === 'collapse') {
            collapseNames.add(row.name);
        }
    }

    const result: FormDict = {};
    for (const row of rows) {
        if (!('items' in row)) {
            continue;
        }
        for (const item of row.items) {
            if (!('name' in item) || !errorNames.includes(item.name) || !item.displayConditions) {
                continue;
            }
            for (const [key, value] of Object.entries(item.displayConditions)) {
                if (collapseNames.has(key)) {
                    result[key] = value;
                }
            }
        }
    }
    return result;
};

export const isFormChanged = (state: DatalensGlobalState) => {
    const {initialForm, form} = state.connections;
    return !isEqual(initialForm, form);
};

export const getPreparedCacheValue = ({
    value,
    maxValue,
    minValue,
}: {
    value: string;
    maxValue: number;
    minValue: number;
}) => {
    if (value === '') {
        return null;
    }

    let result = Number(value);

    if (result < minValue) {
        result = minValue;
    } else if (result > maxValue) {
        result = maxValue;
    }

    return String(result);
};
