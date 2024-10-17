import {ArrowDown, ArrowRight, ArrowUp} from '@gravity-ui/icons';
import type {Field, GraphShared, Placeholder, Shared} from 'shared';
import {AxisNullsMode, WizardVisualizationId} from 'shared';
import {checkAllowedAreaSort} from 'units/wizard/utils/helpers';
import {prepareFieldToMeasureTransformation} from 'units/wizard/utils/visualization';

import {
    lineCommonCheckColor,
    linearCheckColor,
    linearCheckLabels,
    onLineChartDesignItemsChange,
} from '../../utils/visualizations/line';
import {onMeasureAxisChange} from '../../utils/visualizations/placeholders/common-measures';
import {ITEM_TYPES, PRIMITIVE_DATA_TYPES, PRIMITIVE_DATA_TYPES_AND_HIERARCHY} from '../misc';

import {prepareFieldToDimensionTransformation} from './utils';

const LineXPlaceholder = {
    allowedTypes: ITEM_TYPES.ALL,
    allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
    id: 'x',
    type: 'x',
    title: 'section_x',
    iconProps: {data: ArrowRight},
    items: [],
    required: true,
    capacity: 1,
    settings: {
        title: 'off',
        titleValue: '',
        type: 'linear',
        grid: 'on',
        gridStep: 'auto',
        gridStepValue: 50,
        hideLabels: 'no',
        labelsView: 'auto',
        holidays: 'off',
        axisFormatMode: 'auto',
        axisModeMap: {},
        axisVisibility: 'show',
    },
    transform: prepareFieldToDimensionTransformation,
};

const LineYPlaceholder = {
    allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
    allowedFinalTypes: ITEM_TYPES.MEASURES,
    allowedDataTypes: PRIMITIVE_DATA_TYPES,
    id: 'y',
    type: 'y',
    title: 'section_y',
    iconProps: {data: ArrowUp},
    items: [],
    onChange: onMeasureAxisChange,
    settings: {
        scale: 'auto',
        scaleValue: 'min-max',
        title: 'off',
        titleValue: '',
        type: 'linear',
        grid: 'on',
        gridStep: 'auto',
        gridStepValue: 50,
        hideLabels: 'no',
        labelsView: 'auto',
        nulls: AxisNullsMode.Connect,
        axisFormatMode: 'auto',
        axisVisibility: 'show',
    },
    transform: prepareFieldToMeasureTransformation,
};

export const LINE_VISUALIZATION: GraphShared['visualization'] = {
    id: WizardVisualizationId.Line,
    type: 'line',
    name: 'label_visualization-line',
    iconProps: {id: 'visLines', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    allowLabels: true,
    allowSegments: true,
    allowShapes: true,
    colorsCapacity: 1,
    shapesCapacity: 1,
    checkAllowedSort: (
        item: Field,
        visualization: GraphShared['visualization'],
        _colors: Field[],
        segments?: Field[],
    ) => {
        if (item.type === 'MEASURE') {
            return true;
        }

        const selectedItems = visualization.placeholders
            .reduce((a: Field[], b: Placeholder) => a.concat(b.items), [])
            .concat(segments || [])
            .filter((selectedItem) => selectedItem.type === 'DIMENSION');

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    checkAllowedDesignItems: linearCheckColor,
    checkAllowedShapes: linearCheckColor,
    checkAllowedLabels: linearCheckLabels,
    availableLabelModes: ['absolute'],
    onDesignItemsChange: onLineChartDesignItemsChange,
    placeholders: [
        {...LineXPlaceholder},
        LineYPlaceholder,
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'y2',
            type: 'y2',
            title: 'section_y2',
            iconProps: {data: ArrowUp},
            items: [],
            onChange: onMeasureAxisChange,
            settings: {
                scale: 'auto',
                scaleValue: 'min-max',
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                nulls: AxisNullsMode.Connect,
                axisFormatMode: 'auto',
                axisVisibility: 'show',
            },
            transform: prepareFieldToMeasureTransformation,
        },
    ] as Placeholder[],
};

export const LINE_D3_VISUALIZATION: GraphShared['visualization'] = {
    ...LINE_VISUALIZATION,
    id: WizardVisualizationId.LineD3,
    placeholders: [LineXPlaceholder, {...LineYPlaceholder, required: true}],
    allowSegments: false,
};

export const AREA_VISUALIZATION: GraphShared['visualization'] = {
    id: WizardVisualizationId.Area,
    type: 'line',
    name: 'label_visualization-area',
    iconProps: {id: 'visArea', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    allowSegments: true,
    allowLabels: true,
    checkAllowedSort: checkAllowedAreaSort,
    checkAllowedDesignItems: linearCheckColor,
    checkAllowedLabels: linearCheckLabels,
    availableLabelModes: ['absolute'],
    onDesignItemsChange: onLineChartDesignItemsChange,
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.ALL,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
            id: 'x',
            type: 'x',
            title: 'section_x',
            iconProps: {data: ArrowRight},
            items: [],
            required: true,
            capacity: 1,
            settings: {
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                holidays: 'off',
                axisFormatMode: 'auto',
                axisModeMap: {},
            },
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {data: ArrowUp},
            items: [],
            onChange: onMeasureAxisChange,
            settings: {
                scale: 'auto',
                scaleValue: 'min-max',
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                nulls: AxisNullsMode.AsZero,
                axisFormatMode: 'auto',
            },
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};

export const AREA_100P_VISUALIZATION: GraphShared['visualization'] = {
    ...AREA_VISUALIZATION,
    id: WizardVisualizationId.Area100p,
    highchartsId: 'area',
    name: 'label_visualization-area-100p',
    availableLabelModes: ['absolute', 'percent'],
    iconProps: {id: 'visArea100p', width: '24'},
};

export const COLUMN_VISUALIZATION: GraphShared['visualization'] = {
    id: WizardVisualizationId.Column,
    type: 'column',
    name: 'label_visualization-column',
    iconProps: {id: 'visColumn', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    allowSegments: true,
    allowLabels: true,
    checkAllowedSort: (
        item: Field,
        visualization: Shared['visualization'],
        colors: Field[],
        segments?: Field[],
    ) => {
        if (item.type === 'MEASURE') {
            return true;
        }

        const selectedItems = (visualization.placeholders as Placeholder[])
            .reduce((a: Field[], b) => a.concat(b.items), [])
            .concat(colors)
            .concat(segments || [])
            .filter((selectedItem: Field) => selectedItem.type === 'DIMENSION');

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    checkAllowedDesignItems: lineCommonCheckColor,
    checkAllowedLabels: linearCheckLabels,
    availableLabelModes: ['absolute'],
    onDesignItemsChange: onLineChartDesignItemsChange,
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.ALL,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
            id: 'x',
            type: 'x',
            title: 'section_x',
            iconProps: {data: ArrowRight},
            items: [],
            required: false,
            capacity: 2,
            settings: {
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                holidays: 'off',
                axisFormatMode: 'auto',
                axisModeMap: {},
            },
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {data: ArrowUp},
            items: [],
            onChange: onMeasureAxisChange,
            settings: {
                scale: 'auto',
                scaleValue: 'min-max',
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                nulls: AxisNullsMode.Ignore,
                axisFormatMode: 'auto',
            },
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};

export const COLUMN_100P_VISUALIZATION: GraphShared['visualization'] = {
    ...COLUMN_VISUALIZATION,
    id: WizardVisualizationId.Column100p,
    highchartsId: 'column',
    name: 'label_visualization-column-100p',
    availableLabelModes: ['absolute', 'percent'],
    iconProps: {id: 'visColumn100p', width: '24'},
};

export const BAR_VISUALIZATION: GraphShared['visualization'] = {
    id: WizardVisualizationId.Bar,
    type: 'column',
    name: 'label_visualization-bar',
    iconProps: {id: 'visBar', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    allowLabels: true,
    checkAllowedSort: (item: Field, visualization: Shared['visualization'], colors: Field[]) => {
        if (item.type === 'MEASURE') {
            return true;
        }

        const selectedItems = (visualization.placeholders as Placeholder[])
            .reduce((a: Field[], b) => a.concat(b.items), [])
            .concat(colors)
            .filter((selectedItem) => selectedItem.type === 'DIMENSION');

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    checkAllowedDesignItems: lineCommonCheckColor,
    checkAllowedLabels: linearCheckLabels,
    availableLabelModes: ['absolute'],
    onDesignItemsChange: onLineChartDesignItemsChange,
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.ALL,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {data: ArrowDown},
            items: [],
            required: false,
            capacity: 2,
            settings: {
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                axisFormatMode: 'auto',
                axisModeMap: {},
            },
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'x',
            type: 'x',
            title: 'section_x',
            iconProps: {data: ArrowRight},
            items: [],
            onChange: onMeasureAxisChange,
            settings: {
                scale: 'auto',
                scaleValue: 'min-max',
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                nulls: AxisNullsMode.Ignore,
                holidays: 'off',
                axisFormatMode: 'auto',
            },
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};

export const BAR_100P_VISUALIZATION: GraphShared['visualization'] = {
    ...BAR_VISUALIZATION,
    id: WizardVisualizationId.Bar100p,
    highchartsId: 'bar',
    name: 'label_visualization-bar-100p',
    availableLabelModes: ['absolute', 'percent'],
    iconProps: {id: 'visBar100p', width: '24'},
};
