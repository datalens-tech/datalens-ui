import {createSelector} from 'reselect';
import {
    selectDataset,
    selectDimensions,
    selectExtendedDimensionsAndMeasures,
    selectMeasures,
} from 'units/wizard/selectors/dataset';
import {selectHierarchies, selectVisualization} from 'units/wizard/selectors/visualization';
import {selectWidget} from 'units/wizard/selectors/widget';

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

export const selectWizardWorkbookId = createSelector(
    selectWidget,
    selectDataset,
    (widget, dataset) => (widget.workbookId as string | null) || dataset?.workbook_id || null,
);
