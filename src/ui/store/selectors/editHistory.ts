import {DatalensGlobalState} from 'ui';

const _selectUnit = (state: DatalensGlobalState, {unitId}: {unitId: string}) => {
    const unit = state.editHistory.units[unitId];

    if (!unit) {
        throw new Error('Specified history unit does not exist');
    }

    return unit;
};

export const selectCanGoBack = (state: DatalensGlobalState, {unitId}: {unitId: string}) => {
    const unit = _selectUnit(state, {unitId});

    return unit.historyPointIndex > 0;
};

export const selectCanGoForward = (state: DatalensGlobalState, {unitId}: {unitId: string}) => {
    const unit = _selectUnit(state, {unitId});

    return unit.historyPointIndex < unit.states.length - 1;
};
