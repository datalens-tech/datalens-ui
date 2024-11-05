import {
    BranchesDown,
    Calendar,
    CopyCheckXmark,
    GeoDots,
    GeoPolygons,
    Hashtag,
    Hierarchy,
    SquareBracketsBarsVertical,
    SquareBracketsLetterA,
    SquareLetterT,
} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {pick} from 'lodash';
import isEqual from 'lodash/isEqual';
import type {
    CommonNumberFormattingOptions,
    CommonPlaceholders,
    Dataset,
    Field,
    FilterField,
    GeoLayerType,
    HierarchyField,
    PartialBy,
    Placeholder,
    ServerDatasetField,
    Shared,
    Sort,
    Update,
    VisualizationLayerShared,
    VisualizationWithLayersShared,
} from 'shared';
import {
    ChartsConfigVersion,
    DATASET_FIELD_TYPES,
    DatasetFieldType,
    PlaceholderId,
    getResultSchemaFromDataset,
    getSortedData,
    isPseudoField,
    isVisualizationWithLayers,
} from 'shared';

import type {
    CommonPlaceholdersKeys,
    CommonPlaceholdersKeysWithoutConfigs,
} from '../../../../shared/types/wizard/misc';
import {CLIENT_SIDE_FIELD_PROPS} from '../constants';

import {isFieldVisible} from './wizard';

export function getUniqueId(prefix = 'id') {
    return `${prefix}-${Date.now()}`;
}

export function generateNextTitle(existedTitles: string[], title: string) {
    return existedTitles.reduce((nextTitle, currentTitle) => {
        if (nextTitle === currentTitle) {
            const match = nextTitle.match(/\((\d+)\)$/);

            if (match) {
                const i = Number(match[1]);

                nextTitle = nextTitle.replace(/\((\d+)\)$/, `(${i + 1})`);
            } else {
                nextTitle = `${nextTitle} (1)`;
            }
        }

        return nextTitle;
    }, title);
}

export enum CommonDataType {
    Number = 'number',
    Date = 'date',
    Boolean = 'boolean',
    String = 'string',
    Geo = 'geo',
    Hierarchy = 'hierarchy',
    Array = 'array',
    Markup = 'markup',
    Tree = 'tree',
}

// eslint-disable-next-line complexity
export function getCommonDataType(dataType: DATASET_FIELD_TYPES): CommonDataType {
    switch (dataType) {
        case DATASET_FIELD_TYPES.INTEGER:
        case DATASET_FIELD_TYPES.UINTEGER:
        case DATASET_FIELD_TYPES.FLOAT:
            return CommonDataType.Number;

        case DATASET_FIELD_TYPES.DATETIMETZ:
        case DATASET_FIELD_TYPES.GENERICDATETIME:
        case DATASET_FIELD_TYPES.DATE:
            return CommonDataType.Date;

        case DATASET_FIELD_TYPES.GEOPOINT:
        case DATASET_FIELD_TYPES.GEOPOLYGON:
        case DATASET_FIELD_TYPES.HEATMAP:
            return CommonDataType.Geo;

        case DATASET_FIELD_TYPES.BOOLEAN:
            return CommonDataType.Boolean;

        case DATASET_FIELD_TYPES.HIERARCHY:
            return CommonDataType.Hierarchy;

        case DATASET_FIELD_TYPES.ARRAY_FLOAT:
        case DATASET_FIELD_TYPES.ARRAY_INT:
        case DATASET_FIELD_TYPES.ARRAY_STR:
            return CommonDataType.Array;

        case DATASET_FIELD_TYPES.TREE_FLOAT:
        case DATASET_FIELD_TYPES.TREE_INT:
        case DATASET_FIELD_TYPES.TREE_STR:
            return CommonDataType.Tree;

        case DATASET_FIELD_TYPES.MARKUP:
            return CommonDataType.Markup;

        case DATASET_FIELD_TYPES.STRING:
        default:
            return CommonDataType.String;
    }
}

// TODO: Switch to the common DataTypeIcon component
export function getIconForDataType(dataType: DATASET_FIELD_TYPES) {
    const commonDataType = getCommonDataType(dataType);

    switch (commonDataType) {
        case CommonDataType.Number:
            return Hashtag;

        case CommonDataType.Date:
            return Calendar;

        case CommonDataType.Geo: {
            switch (dataType) {
                case DATASET_FIELD_TYPES.GEOPOINT:
                    return GeoDots;
                case DATASET_FIELD_TYPES.GEOPOLYGON:
                default:
                    return GeoPolygons;
            }
        }

        case CommonDataType.Boolean:
            return CopyCheckXmark;

        case CommonDataType.Hierarchy:
            return Hierarchy;

        case CommonDataType.Array:
            return SquareBracketsBarsVertical;

        case CommonDataType.Markup:
            return SquareBracketsLetterA;
        case CommonDataType.Tree:
            return BranchesDown;
        case CommonDataType.String:
        default:
            return SquareLetterT;
    }
}

// TODO: it was a hasty decision, in a good way it needs to be redone like this:
// 1) We store a constant object that has "field: true" or "field: {...}" inside
// 2) With the help of such an object, we get a cast of fields iterating over the fields of this object recursively
export function versionExtractor(this: any, key: string, value: any) {
    if (!value) {
        return undefined;
    }

    let target;
    if (!Array.isArray(value) && typeof value === 'object') {
        target = getSortedData(value);
    } else {
        target = value;
    }

    if (key === 'colors') {
        return JSON.stringify(
            target.map((item: Field) => ({
                guid: item.guid,
                title: item.title,
                fakeTitle: item.fakeTitle,
            })),
        );
    }

    if (this['version'] === ChartsConfigVersion.V1 || typeof this['version'] === 'undefined') {
        if (key === 'dataset') {
            return {
                id: target.id,
            };
        }

        if (key === 'datasets') {
            return JSON.stringify(target.map((dataset: Dataset) => dataset.id));
        }
    }

    if (key === 'datasetsIds') {
        return JSON.stringify(target.sort());
    }

    if (key === 'datasetsPartialFields') {
        return JSON.stringify(
            target
                .reduce((acc: ServerDatasetField[], fields: ServerDatasetField[]) => {
                    return [...acc, ...fields];
                }, [])
                .map((field: ServerDatasetField) => field.guid)
                .sort(),
        );
    }

    if (key === 'dimensions') {
        return undefined;
    }

    if (key === 'measures') {
        return undefined;
    }

    if (key === 'colorsCapacity') {
        return undefined;
    }

    if (key === 'icon') {
        return undefined;
    }

    if (key === 'id') {
        return undefined;
    }

    if (key === 'filters') {
        return JSON.stringify(
            target
                .filter((item: FilterField) => item && !item.unsaved)
                .map((item: FilterField) => {
                    const filterValue = item.filter.value || [];
                    const preparedFilterValue = Array.isArray(filterValue)
                        ? filterValue
                        : [filterValue];

                    const filterOperation = item.filter.operation.code;

                    return `${item.guid} ${filterOperation} ${preparedFilterValue.join()}`;
                }),
        );
    }

    if (key === 'hierarchies') {
        return JSON.stringify(
            target.map(
                (item: HierarchyField) =>
                    `${item.guid},${item.fields
                        .map((item) =>
                            JSON.stringify({guid: item.guid, columnSettings: item.columnSettings}),
                        )
                        .join()}`,
            ),
        );
    }

    if (key === 'items') {
        return JSON.stringify(
            target.map((item: Field) => {
                const formatting: CommonNumberFormattingOptions = item.formatting || {};
                const columnSettings = item.columnSettings || {};
                const barsSettings = item.barsSettings || {};
                const backgroundSettings = item.backgroundSettings || {};
                const subTotalsSettings = item.subTotalsSettings || {};
                const hintSettings = item.hintSettings || {};
                const {fakeTitle, format, hideLabelMode} = item;
                return {
                    guid: item.guid,
                    fakeTitle,
                    format,
                    hideLabelMode,
                    formatting,
                    columnSettings,
                    barsSettings,
                    backgroundSettings,
                    subTotalsSettings,
                    hintSettings,
                    isMarkdown: item.isMarkdown,
                };
            }),
        );
    }

    if (key === 'colorsConfig') {
        return JSON.stringify(target);
    }

    if (key === 'geopointsConfig') {
        return JSON.stringify(target);
    }

    if (key === 'extraSettings') {
        return JSON.stringify(target);
    }

    if (key === 'labels') {
        return JSON.stringify(
            target.map((item: Field) => {
                const formatting: CommonNumberFormattingOptions = item.formatting || {};
                return {guid: item.guid, formatting};
            }),
        );
    }

    if (key === 'links') {
        return JSON.stringify(
            target.map((item: any) => {
                return {
                    id: item.id,
                    fields: Object.keys(item.fields).map((datasetId) => {
                        return {
                            datasetId,
                            fieldGuid: item.fields[datasetId].guid,
                        };
                    }),
                };
            }),
        );
    }

    if (key === 'tooltips') {
        return JSON.stringify(
            target.map((item: Field) => {
                const {fakeTitle, format, formatting = {}, isMarkdown = false} = item;

                return {guid: item.guid, fakeTitle, format, formatting, isMarkdown};
            }),
        );
    }

    if (key === 'shapes') {
        return JSON.stringify(target.map((item: Field) => item.guid));
    }

    if (key === 'shapesConfig') {
        return JSON.stringify(target);
    }

    if (key === 'sort') {
        return JSON.stringify(target.map((item: Sort) => `${item.guid} ${item.direction}`));
    }

    if (key === 'segments') {
        return JSON.stringify(target.map((item: Field) => item.guid));
    }

    return target;
}

export function getDefaultChartName({
    dataset,
    visualization,
}: {
    dataset?: Dataset;
    visualization: Shared['visualization'];
}) {
    if (dataset && dataset.realName && visualization && visualization.name) {
        return `${dataset.realName} — ${i18n('wizard', visualization.name)}`;
    } else {
        return '';
    }
}

export function getDialogItem(items: Field[], placeholders: Placeholder[]) {
    if (items[0] && !isPseudoField(items[0])) {
        return items[0];
    }

    let placeholdersItems: Field[] = [];

    if (placeholders[0].id === PlaceholderId.Heatmap) {
        placeholdersItems = [...placeholders[0].items];
    }

    if (placeholders[1]) {
        placeholdersItems = [...placeholders[1].items];
    }

    if (placeholders[2]) {
        placeholdersItems = placeholdersItems.concat(placeholders[2].items);
    }

    return placeholdersItems.length ? placeholdersItems : undefined;
}

export function getSelectedLayerId(
    visualization: VisualizationWithLayersShared['visualization'],
): string | undefined {
    return visualization.selectedLayerId || visualization.layers[0].layerSettings.id;
}

export function getSelectedLayer(
    visualization: VisualizationWithLayersShared['visualization'],
): VisualizationLayerShared['visualization'] | undefined {
    const layerId = getSelectedLayerId(visualization);
    return visualization.layers.find(({layerSettings: {id}}) => id === layerId);
}

export function checkAllowedAreaSort(
    item: Field,
    visualization: Shared['visualization'],
    colors: Field[],
    segments?: Field[],
) {
    if (item.type === 'MEASURE') {
        return true;
    }

    const selectedItems = (visualization.placeholders as Placeholder[])
        .reduce((a: Field[], b) => a.concat(b.items), [])
        .concat(colors)
        .concat(segments || []);

    return selectedItems.some((selectedItem: Field) => selectedItem.guid === item.guid);
}

export function getVisualization(globalVisualization: Shared['visualization'] | undefined) {
    if (isVisualizationWithLayers(globalVisualization)) {
        return getSelectedLayer(globalVisualization);
    } else {
        return globalVisualization;
    }
}

type ActualizaeUpdatesArgs = {
    updates: Update[];
    visualization?: Shared['visualization'];
    sectionDatasetFields: Field[];
    visualizationFields: Field[];
    onUpdateItemsGuids?: {guid: string; datasetId?: string}[];
};

export function actualizeUpdates({
    updates,
    visualization,
    sectionDatasetFields,
    onUpdateItemsGuids = [],
    visualizationFields,
}: ActualizaeUpdatesArgs): Update[] {
    const currentVisualization = getVisualization(visualization);

    if (!currentVisualization) {
        return updates;
    }

    const getFieldKey = (field: {guid: string; datasetId?: string}) =>
        `${field.datasetId}__${field.guid}`;

    const sectionDatasetFieldsGuids = sectionDatasetFields.reduce<Record<string, Field>>(
        (acc, field) => {
            acc[getFieldKey(field)] = field;

            return acc;
        },
        {},
    );

    const placeholders: Placeholder[] = currentVisualization?.placeholders || [];
    const placeholdersItems = placeholders.reduce((acc: Field[], placeholder: Placeholder) => {
        const items = placeholder.items || [];

        return [...acc, ...items];
    }, [] as Field[]);

    const sectionVisualizationFields = [
        ...placeholdersItems.map((field: Field) => pick(field, 'guid', 'datasetId')),
        ...visualizationFields.map((field: Field) => pick(field, 'guid', 'datasetId')),
        ...onUpdateItemsGuids,
    ].reduce<Record<string, unknown>>((acc, field) => {
        acc[getFieldKey(field)] = field;

        return acc;
    }, {});

    return updates.filter((update: Update) => {
        const field = update.field;
        const key = getFieldKey(field);

        return (
            (sectionDatasetFieldsGuids[key] && isFieldVisible(field as Field)) ||
            sectionVisualizationFields[key]
        );
    });
}

function sorterByLowerCase(a: Field, b: Field) {
    return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
}

export function fieldMerge({
    source,
    target,
}: {
    source: Record<string, any>;
    target: Record<string, any>;
}) {
    CLIENT_SIDE_FIELD_PROPS.forEach((prop) => {
        if (source[prop]) {
            target[prop] = source[prop];
        }
    });
}

type TransformSchemaArgs = {
    schema: PartialBy<Field, 'data_type'>[];
    widgetDataset?: Dataset;
    dataset: Dataset;
};

export function transformSchema({schema, widgetDataset, dataset}: TransformSchemaArgs) {
    const measures: Field[] = [];
    const dimensions: Field[] = [];

    const {id: datasetId} = dataset;

    schema.forEach((item, index) => {
        let type;
        let container;

        if (item.type === 'MEASURE') {
            type = 'measure';
            container = measures;
        } else if (item.type === 'DIMENSION') {
            type = 'dimension';
            container = dimensions;
        } else {
            return;
        }

        const itemCopy: Field = {...item} as Field;

        itemCopy.datasetId = datasetId;
        item.datasetId = datasetId;

        itemCopy.id = `${type}-${index}`;
        itemCopy.data_type = item.data_type || item.cast;

        if (widgetDataset) {
            const widgetResultSchemaItem = getResultSchemaFromDataset(widgetDataset).find(
                (widgetItem) => {
                    return widgetItem.guid === item.guid;
                },
            );

            if (widgetResultSchemaItem) {
                fieldMerge({source: widgetResultSchemaItem, target: itemCopy});
            }
        }

        itemCopy.datasetName = dataset.realName;

        container.push(itemCopy);
    });

    measures.sort(sorterByLowerCase);

    // // Pseudo-fields as (Row Count) move to the end
    // measures.sort((a, b) => {
    //     return a.asPseudo > b.asPseudo ? 1 : -1;
    // });

    dimensions.sort(sorterByLowerCase);

    return {dimensions, measures};
}

export function extractFieldsFromDatasets(datasets: Dataset[]) {
    return datasets.reduce((fields: Field[], dataset: Dataset) => {
        const schema = getResultSchemaFromDataset(dataset);

        const {measures, dimensions} = transformSchema({schema, dataset});
        return [...fields, ...measures, ...dimensions];
    }, [] as Field[]);
}

export function getKeysWithoutConfigs(
    key: CommonPlaceholdersKeys,
): key is CommonPlaceholdersKeysWithoutConfigs {
    return !['colorsConfig', 'geopointsConfig', 'shapesConfig', 'tooltipConfig'].includes(key);
}

export function getAllCommonPlaceholdersFields(commonPlaceholders: CommonPlaceholders[]): Field[] {
    return commonPlaceholders.reduce((acc: Field[], curr: CommonPlaceholders) => {
        const keys = Object.keys(curr) as CommonPlaceholdersKeys[];
        const keysWithoutConfigs =
            keys.filter<CommonPlaceholdersKeysWithoutConfigs>(getKeysWithoutConfigs);

        const fields = getCommonPlaceholderFields(curr, keysWithoutConfigs);

        return [...acc, ...fields];
    }, [] as Field[]);
}

export function getCommonPlaceholderFields(
    commonPlaceholders: CommonPlaceholders,
    keysWithoutConfigs: CommonPlaceholdersKeysWithoutConfigs[],
) {
    return keysWithoutConfigs.reduce((acc: Field[], key) => {
        const placeholderFields = commonPlaceholders[key] || [];

        return [...acc, ...placeholderFields] as Field[];
    }, [] as Field[]);
}

export function shouldComponentUpdateWithDeepComparison<T extends {}>({
    nextProps,
    currentProps,
    deepComparePropKey,
}: {
    nextProps: T;
    currentProps: T;
    deepComparePropKey: keyof T;
}) {
    return (Object.keys(nextProps) as (keyof T)[]).some((currentKey) => {
        if (
            currentKey === deepComparePropKey &&
            currentProps[currentKey] !== nextProps[currentKey]
        ) {
            return !isEqual(currentProps[currentKey], nextProps[currentKey]);
        }

        return currentProps[currentKey] !== nextProps[currentKey];
    });
}

export const getGeolayerGroups = (): GeoLayerType[] => {
    return ['geopoint', 'geopoint-with-cluster', 'polyline', 'geopolygon', 'heatmap'].filter(
        Boolean,
    ) as GeoLayerType[];
};

export const prepareFieldForUpdate = ({
    field,
    groupingChanged,
}: {
    field: Field;
    groupingChanged?: boolean;
}): Field => {
    if (!field.autoaggregated) {
        if (field.aggregation === 'none') {
            field.type = DatasetFieldType.Dimension;
        } else {
            field.type = DatasetFieldType.Measure;
        }
    }

    if (groupingChanged && field.grouping && field.grouping === 'none') {
        field.formula = field.originalFormula || '';
        field.cast = (field.originalDateCast || field.cast) as DATASET_FIELD_TYPES;
        field.data_type = (field.originalDateCast || field.data_type) as DATASET_FIELD_TYPES;
        field.source = field.originalSource || field.source;

        // After we have removed the grouping, we delete the data about the original source and caste
        delete field.originalDateCast;
        delete field.originalSource;
    } else if (groupingChanged && field.grouping) {
        const [operation, mode] = field.grouping.split('-');

        let functionName;
        if (operation === 'trunc') {
            functionName = 'datetrunc';
        } else {
            functionName = 'datepart';
            field.data_type = DATASET_FIELD_TYPES.INTEGER;
            field.cast = DATASET_FIELD_TYPES.INTEGER;
        }

        // If there is a source, it means that this field has not been grouped yet
        if (field.source) {
            field.formula = `${functionName}([${field.source}], "${mode}")`;

            field.originalDateCast = field.cast;
            field.originalSource = field.source;

            field.source = '';
        } else {
            const argument = field.originalSource
                ? `[${field.originalSource}]`
                : field.originalFormula;
            field.formula = `${functionName}(${argument}, "${mode}")`;
        }

        delete (field as any).cast;
        delete (field as any).data_type;
    }

    // A field could have been changed to a formula
    if (field.formula) {
        field.calc_mode = 'formula';
    } else {
        field.calc_mode = 'direct';
    }

    return field;
};

export const prepareFieldForCreate = ({
    field,
    dataset,
}: {
    field: Field;
    dataset: Dataset;
}): Field => {
    const {calc_mode: calcMode} = field;

    const fieldNext = {
        ...field,
        datasetId: dataset.id,
    };

    if (calcMode === 'formula') {
        delete (fieldNext as any).cast;
        delete (fieldNext as any).data_type;
    }

    return fieldNext;
};
