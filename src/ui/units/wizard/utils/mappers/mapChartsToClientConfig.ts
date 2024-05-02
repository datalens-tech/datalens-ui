import {
    ChartsConfig,
    ClientChartsConfig,
    CommonSharedExtraSettings,
    Dataset,
    Field,
    FilterField,
    HierarchyField,
    LabelsPositions,
    Link,
    Placeholder,
    PointSizeConfig,
    PseudoFieldTitle,
    ServerColor,
    ServerField,
    ServerFilter,
    ServerLabel,
    ServerShape,
    ServerSort,
    ServerTooltip,
    Shared,
    Sort,
    Update,
    VISUALIZATION_IDS,
    VisualizationWithLayersShared,
    createMeasureNames,
    createMeasureValues,
    getResultSchemaFromDataset,
    isFieldHierarchy,
    isParameter,
} from 'shared';

import {extractFieldsFromDatasets} from '../helpers';

export function selectChartsConfigUpdates(data: ChartsConfig, datasets: Dataset[]) {
    const updatesToProcess = data.updates !== undefined ? (data.updates as Update[]) : [];

    const updates: Update[] = processUpdates(updatesToProcess);

    const parametersGuidsByDatasetId = datasets.reduce(
        (acc, dataset: Dataset) => {
            acc[dataset.id] = getResultSchemaFromDataset(dataset)
                .filter(isParameter)
                .map((field) => field.guid);

            return acc;
        },
        {} as Record<string, string[]>,
    );

    return updates.filter((update) => {
        const field = update.field;
        const action = update.action;
        // If we have a parameter in the original dataset, then its update needs to be filtered out
        // Because we are not able to create a local parameter with the same guid (Parameter name)
        const parametersGuids = parametersGuidsByDatasetId[field.datasetId || ''] || [];
        const parameterExistsInDataset = parametersGuids.includes(update.field.guid);
        const isAddActionUpdate = action === 'add_field' || action === 'add';
        if (isParameter(field)) {
            return !parameterExistsInDataset || !isAddActionUpdate;
        }

        return true;
    });
}

export function mapChartsConfigToClientConfig(
    data: ChartsConfig,
    datasets: Dataset[],
    originalDatasets: Record<string, Dataset>,
): ClientChartsConfig {
    const serverColors: ServerColor[] = data.colors || [];
    const serverFilters: ServerFilter[] = data.filters || [];
    const serverLabels: ServerLabel[] = data.labels || [];
    const serverSort: ServerSort[] = data.sort || [];
    const serverTooltips: ServerTooltip[] = data.tooltips || [];
    const serverShape: ServerShape[] = data.shapes || [];
    const serverSegments: ServerField[] = data.segments || [];
    const serverHierarchy: HierarchyField[] =
        data.hierarchies !== undefined ? (data.hierarchies as unknown as HierarchyField[]) : [];
    const serverVisualization: Shared['visualization'] =
        data.visualization !== undefined
            ? (data.visualization as unknown as Shared['visualization'])
            : ({} as Shared['visualization']);

    const links: Link[] = data.links !== undefined ? data.links : [];
    const colorsConfig: object = data.colorsConfig !== undefined ? data.colorsConfig : {};
    const geopointsConfig: PointSizeConfig =
        data.geopointsConfig !== undefined ? data.geopointsConfig : ({} as PointSizeConfig);
    const shapesConfig: object = data.shapesConfig !== undefined ? data.shapesConfig : {};
    const updates: Update[] = selectChartsConfigUpdates(data, Object.values(originalDatasets));
    let extraSettings: Shared['extraSettings'] = data.extraSettings as Shared['extraSettings'];

    if (!extraSettings) {
        extraSettings = {
            title: '',
            titleMode: 'show',
        } as CommonSharedExtraSettings;
    }

    if (
        !extraSettings.labelsPosition &&
        [VISUALIZATION_IDS.COLUMN, VISUALIZATION_IDS.BAR].includes(serverVisualization.id)
    ) {
        extraSettings.labelsPosition = LabelsPositions.Inside;
    }

    const fields = extractFieldsFromDatasets(datasets);

    const fieldsDict: Record<string, Field> = fields.reduce((acc: Record<string, Field>, field) => {
        acc[`${field.guid}_${field.datasetId}`] = field;
        return acc;
    }, {});

    let colors = mapServerFieldToWizardField<Field>(serverColors, fieldsDict);
    const filters = mapServerFieldToWizardField<FilterField>(serverFilters, fieldsDict);
    const labels = mapServerFieldToWizardField<Field>(serverLabels, fieldsDict);
    const sort = mapServerFieldToWizardField<Sort>(serverSort, fieldsDict);
    const tooltips = mapServerFieldToWizardField<Field>(serverTooltips, fieldsDict);
    const shapes = mapServerFieldToWizardField<Field>(serverShape, fieldsDict);
    const segments = mapServerFieldToWizardField<Field>(serverSegments, fieldsDict);
    const hierarchies = mapServerFieldToWizardField<HierarchyField>(
        serverHierarchy,
        fieldsDict,
    ).map((item) => {
        return {
            ...item,
            fields: mapServerFieldToWizardField<Field>(item.fields, fieldsDict),
        };
    });

    const layerVisualization =
        serverVisualization as VisualizationWithLayersShared['visualization'];

    const visualization: Shared['visualization'] = {
        ...serverVisualization,
        placeholders: serverVisualization.placeholders?.map((placeholder: Placeholder) => {
            return {
                ...placeholder,
                items: mapServerFieldToWizardField<Field>(placeholder.items, fieldsDict),
            };
        }),
        layers: layerVisualization.layers?.map((layer) => {
            const {placeholders, commonPlaceholders} = layer;
            const layerColors = mapServerFieldToWizardField<Field>(
                commonPlaceholders.colors,
                fieldsDict,
            );

            if (layer.layerSettings.id === layerVisualization.selectedLayerId) {
                colors = layerColors;
            }

            return {
                ...layer,
                placeholders: placeholders.map((placeholder: Placeholder) => {
                    return {
                        ...placeholder,
                        items: mapServerFieldToWizardField<Field>(placeholder.items, fieldsDict),
                    };
                }),
                commonPlaceholders: {
                    ...commonPlaceholders,
                    colors: layerColors,
                },
            };
        }),
    } as Shared['visualization'];

    return {
        ...(data as unknown as ClientChartsConfig),
        visualization,
        colors,
        labels,
        filters,
        sort,
        tooltips,
        hierarchies,
        shapes,
        links,
        colorsConfig,
        geopointsConfig,
        shapesConfig,
        updates,
        extraSettings,
        segments,
    };
}

export function mapServerFieldToWizardField<T>(
    serverFields: any[] | undefined,
    fieldsDict: Record<string, Field>,
): T[] {
    return (serverFields || []).map((serverField) => {
        const key = `${serverField.guid}_${serverField.datasetId}`;

        let sourceField = fieldsDict[key];

        if (!sourceField && serverField.title === PseudoFieldTitle.MeasureNames) {
            sourceField = createMeasureNames();
        }

        if (!sourceField && serverField.title === PseudoFieldTitle.MeasureValues) {
            sourceField = createMeasureValues();
        }

        let valid: boolean | null;

        if (isFieldHierarchy(serverField)) {
            const fields = serverField.fields || [];
            valid = fields.every((field: Field) => field.valid);
        } else {
            valid = sourceField ? sourceField.valid : false;
        }
        return {
            ...serverField,
            ...sourceField,
            valid,
        };
    });
}

function processUpdates(updates: Update[]): Update[] {
    return updates.map((item: Update) => {
        // In part of the saved charts, we may have incorrect updates saved, and in this function we are trying to normalize them.
        // Example of invalid updates:
        // 1. update with action === add_field but without the required "title" field
        if (item.action === 'add_field' && !item.field.title) {
            return {
                ...item,
                action: 'update_field',
            };
        }

        return item;
    });
}
