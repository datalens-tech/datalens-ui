import {createSelector} from 'reselect';
import {
    selectDimensions,
    selectExtendedDimensionsAndMeasures,
    selectMeasures,
} from 'units/wizard/selectors/dataset';
import {selectHierarchies, selectVisualization} from 'units/wizard/selectors/visualization';

const extendedDimensionsAndMeasuresSelector = createSelector(
    selectVisualization,
    selectDimensions,
    selectMeasures,

    selectExtendedDimensionsAndMeasures,
);

export const addFieldContainerFieldsSelector = createSelector(
    extendedDimensionsAndMeasuresSelector,
    selectHierarchies,
    ({measures, dimensions}, hierarchies) => [...dimensions, ...hierarchies, ...measures],
);
