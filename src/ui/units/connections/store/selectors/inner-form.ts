import type {DatalensGlobalState} from 'ui';

import {InnerFieldKey} from '../../constants';

export const innerFormSelector = (state: DatalensGlobalState) => {
    return state.connections.innerForm;
};

export const innerAuthorizedSelector = (state: DatalensGlobalState) => {
    const innerForm = innerFormSelector(state);
    return innerForm[InnerFieldKey.Authorized] as boolean;
};
