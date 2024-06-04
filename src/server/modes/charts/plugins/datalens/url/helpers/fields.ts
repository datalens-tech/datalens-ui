import type {ApiV2BackgroundSettingsGuids, Link, ServerField} from '../../../../../../../shared';
import {WizardVisualizationId} from '../../../../../../../shared';
import type {ServerFieldWithBackgroundSettings} from '../../types';
import {isTableFieldBackgroundSettingsEnabled} from '../../utils/misc-helpers';

export const prepareFieldsForPayload = (
    fields: ServerField[],
    datasetId: string,
    links?: Link[],
): string[] => {
    return fields
        .filter((field) => {
            const datasetsIdMatching = field.datasetId === datasetId;

            // Checking if this field is in needed dataset
            if (datasetsIdMatching) {
                return true;
            }

            // Checking if this field is linked to other datasets
            const linkForField = links?.find(({fields: linkFields}) => {
                return (
                    Boolean(linkFields[datasetId]) &&
                    Object.keys(linkFields).some((linkedDatasetId) => {
                        return linkFields[linkedDatasetId].field.guid === field.guid;
                    })
                );
            });

            return linkForField;
        })
        .map((field) => field.guid);
};

export const getBackgroundColorFieldsIds = (
    fields: ServerField[],
    datasetId: string,
    visualizationId: WizardVisualizationId,
): ApiV2BackgroundSettingsGuids[] => {
    let preparedFields = fields.filter(
        (field): field is ServerFieldWithBackgroundSettings =>
            field.datasetId === datasetId && isTableFieldBackgroundSettingsEnabled(field),
    );
    if (visualizationId === WizardVisualizationId.FlatTable) {
        preparedFields = preparedFields.filter(
            (field) => field.backgroundSettings.settings.isContinuous,
        );
    }
    return preparedFields.map((field) => ({
        colorFieldGuid: field.backgroundSettings.colorFieldGuid,
        targetFieldGuid: field.guid,
        isContinuous: field.backgroundSettings.settings.isContinuous,
    }));
};

export const prepareColumns = ({
    fields,
    datasetId,
    parameters,
    backgroundColorsFieldsIds,
}: {
    fields: ServerField[];
    parameters: ServerField[];
    backgroundColorsFieldsIds: ApiV2BackgroundSettingsGuids[];
    datasetId: string;
}): string[] => {
    const rawColumns = [
        ...prepareFieldsForPayload(fields, datasetId),
        // The parameters that lie in the main sections need to be compared with the fields for rendering
        ...prepareFieldsForPayload(parameters, datasetId),
        ...backgroundColorsFieldsIds.map(({colorFieldGuid}) => colorFieldGuid),
    ];

    return Array.from(new Set(rawColumns));
};
