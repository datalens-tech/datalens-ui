import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {useSelector} from 'react-redux';
import type {Field, NestedPartial, TableFieldBackgroundSettings} from 'shared';
import {isMeasureField, isMeasureName, isNumberField} from 'shared';

import {
    selectDialogColorGradientState,
    selectDialogColorPaletteState,
} from '../../../../../../selectors/dialogColor';
import {
    extractGradientSettings,
    extractPaletteSettings,
    getDefaultGradientSettings,
    getDefaultPaletteSettings,
} from '../../../utils/backgroundSettings';

import {getBackgroundColorFieldSelectorItems, isSelectedFieldMeasureName} from './helpers';

type UseBackgroundColorFieldSelectArgs = {
    chartFields: Field[];
    datasetFieldsMap: Record<string, boolean>;
    currentField: Field;
    onUpdate: (args: NestedPartial<TableFieldBackgroundSettings, 'settings'>) => void;
    state: TableFieldBackgroundSettings;
};

type UseBackgroundColorFieldSelect = {
    handleSelectUpdate: (guid: string) => void;
    selectItems: SelectOption<{icon: JSX.Element}>[];
};

function getDefaultColorFieldGuid(field: Field, items: SelectOption[]) {
    if (isMeasureField(field) && !isNumberField(field)) {
        return items[0]?.value || field.guid;
    }

    if (isMeasureName(field)) {
        return field.title;
    }

    return field.guid;
}

export const useBackgroundColorFieldSelect = ({
    chartFields,
    onUpdate,
    currentField,
    state,
    datasetFieldsMap,
}: UseBackgroundColorFieldSelectArgs): UseBackgroundColorFieldSelect => {
    const paletteState = useSelector(selectDialogColorPaletteState);
    const gradientState = useSelector(selectDialogColorGradientState);

    const selectItems = getBackgroundColorFieldSelectorItems(chartFields, datasetFieldsMap);
    const isColorFieldAvailable = selectItems.some((item) => item.value === state.colorFieldGuid);
    const colorFieldGuid = getDefaultColorFieldGuid(currentField, selectItems);

    React.useEffect(() => {
        if (!isColorFieldAvailable) {
            const isContinuous = isMeasureField(currentField);
            const settings: TableFieldBackgroundSettings['settings'] = {
                isContinuous,
                gradientState: {},
                paletteState: {},
            };

            if (isContinuous) {
                settings.gradientState = getDefaultGradientSettings();
            } else {
                settings.paletteState = getDefaultPaletteSettings();
            }

            onUpdate({
                colorFieldGuid,
                settings,
            });
        }
    }, [currentField, onUpdate, state.colorFieldGuid, isColorFieldAvailable, colorFieldGuid]);

    const handleSelectUpdate = React.useCallback(
        (guid: string) => {
            const columnField = chartFields.find(
                (item: Field) => item.guid === guid || isSelectedFieldMeasureName(item, guid),
            );

            if (columnField) {
                const isMeasure = isMeasureField(columnField);
                if (isMeasure) {
                    onUpdate({
                        colorFieldGuid: guid,
                        settings: {
                            paletteState: {},
                            gradientState: extractGradientSettings(gradientState),
                            isContinuous: true,
                        },
                    });
                } else {
                    onUpdate({
                        colorFieldGuid: guid,
                        settings: {
                            paletteState: extractPaletteSettings(paletteState),
                            gradientState: {},
                            isContinuous: false,
                        },
                    });
                }
            }
        },
        [chartFields, gradientState, onUpdate, paletteState],
    );

    return {
        handleSelectUpdate,
        selectItems,
    };
};
