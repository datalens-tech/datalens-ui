import type {DatalensGlobalState} from '../../';

const _selectUnit = (state: DatalensGlobalState, {unitId}: {unitId: string}) => {
    const unit = state.editHistory.units[unitId];

    if (!unit) {
        throw new Error('Specified history unit does not exist');
    }

    return unit;
};

export const selectCanGoBack = (state: DatalensGlobalState, {unitId}: {unitId: string}) => {
    const unit = _selectUnit(state, {unitId});

    // Actual point index should not be initial
    return unit.pointIndex > 0;
};

export const selectCanGoForward = (state: DatalensGlobalState, {unitId}: {unitId: string}) => {
    const unit = _selectUnit(state, {unitId});

    // Actual point index should not be last
    return unit.pointIndex < unit.diffs.length - 1;
};

export const hasHistoryChanges = (state: DatalensGlobalState, {unitId}: {unitId: string}) => {
    try {
        const unit = _selectUnit(state, {unitId});

        return unit.pointIndex > 0;
    } catch (err) {
        return false;
    }
};
