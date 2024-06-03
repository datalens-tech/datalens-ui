import {isEqual} from 'lodash';
import type {BaseItem} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import type {ConnectionsReduxState} from '../../../store';

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

export const isFormChanged = (state: DatalensGlobalState) => {
    const {initialForm, form} = state.connections;
    return !isEqual(initialForm, form);
};
