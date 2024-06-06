import type {
    Placeholder,
    V4ChartsConfig,
    V4Field,
    V4HierarchyField,
    V4Sort,
    V4Visualization,
} from '../../../../types';

export const MOCKED_V4_FIELD = {
    guid: 'field-1',
    data_type: 'string',
} as V4Field;

export const MOCKED_V4_FIELD_WITH_DATE_MODE = {
    guid: 'field-3',
    data_type: 'date',
    dateMode: 'discrete',
} as V4Field;

export const MOCKED_V4_HIERARCHY_FIELD = {
    guid: 'hierarchy-1',
    type: 'PSEUDO',
    data_type: 'hierarchy',
    fields: [MOCKED_V4_FIELD],
} as V4HierarchyField;

export const MOCKED_SHARED_DATA = {
    metaHierarchy: {
        column: {
            hierarchyIndex: 0,
            hierarchyFieldIndex: 0,
        },
    },
};

export const getMockedV4Visualization = ({
    visualizationId,
    placeholders,
}: {
    visualizationId: string;
    placeholders?: Partial<Placeholder>[];
}) => {
    return {
        id: visualizationId,
        placeholders: placeholders || [],
    } as V4Visualization;
};

export const getMockedV4Config = ({
    visualizationId,
    placeholders,
    sort,
}: {
    visualizationId: string;
    placeholders?: Partial<Placeholder>[];
    sort?: Partial<V4Sort>;
}) => {
    return {
        visualization: getMockedV4Visualization({visualizationId, placeholders}),
        sort: sort || [],
    } as V4ChartsConfig;
};
