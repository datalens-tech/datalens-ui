import {getAvailableVisualizations} from 'ui/units/wizard/utils/visualization';

import type {
    ColorsConfig,
    Dataset,
    DatasetField,
    Field,
    FilterField,
    HierarchyField,
    PartialBy,
    Placeholder,
    Shared,
    Sort,
    Update,
    VisualizationLayerShared,
} from '../../../../../shared';
import {getResultSchemaFromDataset, isParameter} from '../../../../../shared';
import {VISUALIZATION_IDS} from '../../../../constants/visualizations';
import type {VisualizationState} from '../../reducers/visualization';
import {fieldMerge, getVisualization, transformSchema} from '../../utils/helpers';

import {mutateAndValidateItem} from './mutateAndValidateItem';

interface ValidateHierarchiesArgs {
    hierarchies: HierarchyField[];
    fields: Field[];
}

function validateHierarchies({hierarchies, fields}: ValidateHierarchiesArgs) {
    const fieldsDict = fields.reduce((acc: Record<string, boolean>, field) => {
        acc[field.guid] = true;
        return acc;
    }, {});

    return hierarchies.map((hierarchy) => {
        let valid = true;
        let undragable = false;
        let conflict;

        const validatedFields = hierarchy.fields
            .filter((field) => fieldsDict[field.guid])
            .map((field) => {
                const newField = {...field};

                mutateAndValidateItem({fields, item: newField});

                if (!newField.valid) {
                    valid = false;
                    conflict = 'invalid';
                    undragable = true;
                }

                return newField;
            });

        return {
            ...hierarchy,
            fields: validatedFields,
            valid,
            conflict,
            undragable,
        };
    });
}

function isDeleteUpdate(update: Update) {
    return update.action === 'delete' || update.action === 'delete_field';
}

function mergeUpdates(args: {
    prevUpdates: Update[];
    updates: Update[];
    datasetId: string;
    availableDatasetIds: string[];
}) {
    const {prevUpdates, updates, datasetId, availableDatasetIds} = args;
    const usedDatasetIds = new Set([...availableDatasetIds, datasetId]);
    // Here we delete the old updates that are not relevant, so as not to store them,
    const filteredOldUpdates = prevUpdates.reduceRight((acc: Update[], newestOldUpdate) => {
        const needsDelete =
            (newestOldUpdate.field.datasetId &&
                !usedDatasetIds.has(newestOldUpdate.field.datasetId)) ||
            isDeleteUpdate(newestOldUpdate) ||
            updates.some((newUpdate: Update) => {
                const fieldDatasetId = newUpdate.field.datasetId || datasetId;

                if (
                    newestOldUpdate.field.datasetId !== fieldDatasetId ||
                    newestOldUpdate.field.guid !== newUpdate.field.guid
                ) {
                    return false;
                }

                if (isDeleteUpdate(newUpdate)) {
                    return true;
                }

                // If both elements of updates are update_field, then just merge them as update_field
                // Otherwise, one of the updates elements is add_field. Move to the new update c add_field
                if (
                    !(
                        newUpdate.action === 'update_field' &&
                        newestOldUpdate.action === 'update_field'
                    )
                ) {
                    newUpdate.action = 'add_field';
                }

                newUpdate.field = {
                    ...newestOldUpdate.field,
                    ...newUpdate.field,
                };

                newUpdate.debug_info = 'merged-update';

                // Deleting the merged updates
                return true;
            });

        if (!needsDelete) {
            acc.unshift(newestOldUpdate);
        }

        return acc;
    }, []);

    const fieldsWithRenamedGuides = updates.reduce((acc, update) => {
        if (
            update.field.new_id &&
            update.field.new_id !== update.field.guid &&
            !isDeleteUpdate(update)
        ) {
            acc.set(update.field.new_id, update);
        }
        return acc;
    }, new Map<Update['field']['new_id'], Update>());

    updates.forEach((update: Update) => {
        if (fieldsWithRenamedGuides.has(update.field.guid) && update.action === 'update_field') {
            update.field = {
                ...fieldsWithRenamedGuides.get(update.field.guid)?.field,
                ...update.field,
            };
            delete update.field['new_id'];
            update.action = 'add_field';
        }
    });

    const filteredNewUpdates = updates.filter((update: Update) => {
        return (
            !isDeleteUpdate(update) &&
            !update.deleteUpdateAfterValidation &&
            !fieldsWithRenamedGuides.has(update.field.new_id)
        );
    });

    return filteredOldUpdates.concat(filteredNewUpdates);
}

function getVisualizationFields(wizardVisualization: VisualizationState) {
    const {filters = [], labels = [], tooltips = []} = wizardVisualization;

    const visualization = getVisualization(wizardVisualization.visualization);
    const layerFilters: FilterField[] =
        wizardVisualization.visualization?.id === VISUALIZATION_IDS.GEOLAYER
            ? (visualization as VisualizationLayerShared['visualization']).commonPlaceholders
                  .filters
            : [];

    return [...labels, ...filters, ...layerFilters, ...tooltips];
}

export type UpdateDatasetArgs = {
    dataset: Dataset;
    updates: Update[];
    datasetSchema: DatasetField[];

    currentDatasets: {id: string}[];
    currentUpdates: Update[];
    visualization: VisualizationState;
};

type UpdateDatasetResult = {
    sort?: Sort[];
    colors?: Field[];
    colorsConfig?: ColorsConfig;
    placeholders: Placeholder[];
    hierarchies?: HierarchyField[];
    dimensions?: Field[];
    measures?: Field[];
    schema?: DatasetField[];
    updates: Update[];
};

export function getDatasetUpdates(args: UpdateDatasetArgs) {
    const {
        dataset,
        updates,
        datasetSchema: newResultSchema,
        currentDatasets: prevDatasets,
        visualization: wizardVisualization,
        currentUpdates: oldUpdates,
    } = args;
    const result: UpdateDatasetResult = {
        placeholders: [],
        updates: [],
    };

    const resultSchema = getResultSchemaFromDataset(dataset);

    const {colors = [], colorsConfig, sort = []} = wizardVisualization;
    const visualization = getVisualization(wizardVisualization.visualization);
    const placeholders: Placeholder[] = visualization?.placeholders || [];
    const wizardVisualizationFields = getVisualizationFields(wizardVisualization);

    const availableVisualizations = getAvailableVisualizations();
    const presetVisualization = availableVisualizations.find(({id}) => id === visualization?.id) as
        | Shared['visualization']
        | null;

    // Let's go through the new scheme
    newResultSchema.forEach((datasetField) => {
        const field = datasetField as Field;
        // A check so that the server does not fall from null
        Object.keys(field).forEach((prop: string) => {
            if ((field as Record<string, any>)[prop] === null) {
                delete (field as Record<string, any>)[prop];
            }
        });

        const oldField = resultSchema.find((oldField) => oldField.guid === field.guid);
        if (oldField) {
            // If there was such a field
            // We perform a partial merge, leaving only meta tags
            if (oldField.local) {
                field.local = true;
            }

            if ((oldField as Field).quickFormula) {
                (field as Field).quickFormula = true;
            }

            const oldUpdateEntry = oldUpdates.find(
                ({field: oldUpdateField}) => oldUpdateField.guid === field.guid,
            );

            if (oldUpdateEntry) {
                oldUpdateEntry.field = field;
            }
        } else {
            // If there was no such field, it means it is new, and therefore local
            field.local = true;
        }
    });

    // Initializing updates
    updates.forEach((entry) => {
        const {field: fieldFromUpdates} = entry;

        if (
            entry.action === 'update' ||
            entry.action === 'add' ||
            entry.action === 'update_field' ||
            entry.action === 'add_field'
        ) {
            // We apply the addition or update

            const field = newResultSchema.find((fieldFromNewSchema: DatasetField) => {
                return fieldFromNewSchema.guid === fieldFromUpdates.guid;
            });

            if (field) {
                fieldMerge({source: fieldFromUpdates, target: field});
                entry.field = field;
            }
        }
    });

    const {dimensions, measures} = transformSchema({
        schema: newResultSchema as PartialBy<Field, 'data_type'>[],
        dataset,
    });

    let sortUpdateRequired = false;
    let colorsUpdateRequired = false;

    [...dimensions, ...measures].forEach((field) => {
        if (!field.valid) {
            field.conflict = 'invalid';
            field.undragable = true;
        }

        sort.forEach((item) => {
            if (item.guid === field.guid) {
                Object.assign(item, field);

                sortUpdateRequired = true;
            }
        });

        colors.forEach((item) => {
            if (item.guid === field.guid) {
                Object.assign(item, field);
                colorsConfig.fieldGuid = field.guid;

                colorsUpdateRequired = true;
            }
        });

        // Updating local fields in sections that were not touched above
        wizardVisualizationFields.forEach((item: Field) => {
            const isItemExists = item.guid === field.guid;
            const isItemLocal = item.local;
            const isItemParameter = isParameter(item);
            if ((isItemLocal || isItemParameter) && isItemExists) {
                Object.assign(item, field);
                mutateAndValidateItem({fields: newResultSchema as Field[], item: item as Field});
            }
        });

        placeholders.forEach((placeholder) => {
            const presetPlaceholder = presetVisualization?.placeholders.find(
                (p) => p.id === placeholder.id,
            );
            let placeholderUpdateRequired = false;

            placeholder.items
                .filter((item) => item.datasetId === dataset.id)
                .forEach((item) => {
                    if (item.guid === field.guid) {
                        Object.assign(item, field);

                        mutateAndValidateItem({
                            fields: newResultSchema as Field[],
                            item,
                            placeholder: presetPlaceholder,
                        });

                        placeholderUpdateRequired = true;
                    }

                    if (item.type !== 'PSEUDO') {
                        if (item.valid) {
                            delete item.undragable;

                            const datasetExist = prevDatasets.some(({id}) => id === item.datasetId);

                            if (datasetExist) {
                                delete item.conflict;
                            }
                        } else {
                            item.undragable = true;
                            item.conflict = item.conflict || 'invalid';
                        }
                    }
                });

            if (placeholderUpdateRequired && visualization) {
                result.placeholders.push(placeholder);
            }
        });
    });

    result.schema = newResultSchema;
    result.updates = mergeUpdates({
        prevUpdates: oldUpdates,
        updates,
        datasetId: dataset.id,
        availableDatasetIds: prevDatasets.map((d) => d.id),
    });
    result.dimensions = dimensions;
    result.measures = measures;
    result.hierarchies = validateHierarchies({
        hierarchies: wizardVisualization.hierarchies,
        fields: newResultSchema as Field[],
    });

    if (sortUpdateRequired) {
        result.sort = sort;
    }

    if (colorsUpdateRequired) {
        result.colors = colors;
        result.colorsConfig = colorsConfig;
    }

    return result;
}
