import React from 'react';

import {SegmentedRadioGroup as RadioButton, Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {
    ClientChartsConfig,
    Field,
    NestedPartial,
    PlaceholderId,
    TableFieldBackgroundSettings,
    WizardVisualizationId,
} from 'shared';
import {DialogFieldBackgroundSettingsQa, GradientNullModes} from 'shared';
import {NULLS_OPTIONS} from 'ui/units/wizard/constants/dialogColor';

import {DialogRadioButtons} from '../../../components/DialogRadioButtons/DialogRadioButtons';
import {ButtonColorDialog} from '../ButtonColorDialog/ButtonColorDialog';
import {DialogFieldRow} from '../DialogFieldRow/DialogFieldRow';
import {DialogFieldSelect} from '../DialogFieldSelect/DialogFieldSelect';

import {useBackgroundColorFieldSelect} from './hooks/useBackgrounColorFieldSelect';
import {
    BackgroundColorMode,
    useBackgroundColorModeRadioButtons,
} from './hooks/useBackgroundColorModeRadioButtons';
import {useBackgroundNullModeSettings} from './hooks/useBackgroundNullModeSettings';
import {useBackgroundSettings} from './hooks/useBackgroundSettings';
import {useBackgroundSettingsButtonColorDialog} from './hooks/useBackgroundSettingsButtonColorDialog';
import {useBackgroundSettingsSwitch} from './hooks/useBackgroundSettingsSwitch';

import './BackgroundSettings.scss';
const b = block('background-settings');

type Props = {
    onUpdate: (backgroundSettings: NestedPartial<TableFieldBackgroundSettings, 'settings'>) => void;
    state: TableFieldBackgroundSettings;
    visualization: ClientChartsConfig['visualization'];
    currentField: Field;

    placeholderId: PlaceholderId;
};

export const BackgroundSettings: React.FC<Props> = (props) => {
    const {state, onUpdate, visualization, currentField, placeholderId} = props;

    const {field, datasetFieldsMap, chartFields, extraDistincts} = useBackgroundSettings({
        visualization,
        state,
        currentField,
        placeholderId,
    });

    const {handleSelectUpdate, selectItems} = useBackgroundColorFieldSelect({
        currentField,
        datasetFieldsMap,
        chartFields,
        state,
        onUpdate,
    });

    const {handleSwitchUpdate} = useBackgroundSettingsSwitch({onUpdate});

    const {handleModeRadioButtonsUpdate, selectedRadioButton, radioButtonOptions} =
        useBackgroundColorModeRadioButtons({
            onUpdate,
            field,
            state,
            placeholderId,
            visualizationId: visualization.id as WizardVisualizationId,
        });

    const {handleDialogColorApply, paletteId, paletteType, colorsConfig} =
        useBackgroundSettingsButtonColorDialog({
            onUpdate,
            state,
        });

    const {nullMode, handleNullModeUpdate} = useBackgroundNullModeSettings({
        onUpdate,
        state,
    });

    return (
        <div className={b()}>
            <DialogFieldRow
                title={i18n('wizard', 'label_background-settings')}
                setting={
                    <Switch
                        checked={state.enabled}
                        onUpdate={handleSwitchUpdate}
                        disabled={!selectItems.length}
                        qa={DialogFieldBackgroundSettingsQa.EnableButton}
                    />
                }
            />
            <DialogFieldRow
                title={i18n('wizard', 'label_background-color-field-selector')}
                setting={
                    <DialogFieldSelect
                        options={selectItems}
                        value={state.colorFieldGuid}
                        showItemIcon={true}
                        onUpdate={handleSelectUpdate}
                        disabled={!state.enabled}
                    />
                }
            />
            <DialogFieldRow
                title={i18n('wizard', 'label_fill-color-type')}
                setting={
                    <DialogRadioButtons
                        items={radioButtonOptions}
                        value={selectedRadioButton}
                        onUpdate={handleModeRadioButtonsUpdate}
                        disabled={!state.enabled}
                        qa={DialogFieldBackgroundSettingsQa.FillTypeButtons}
                    />
                }
            />
            <DialogFieldRow
                title={''}
                setting={
                    <ButtonColorDialog
                        disabled={!state.enabled}
                        paletteType={paletteType}
                        paletteId={paletteId}
                        colorsConfig={colorsConfig}
                        onApplyDialogColor={handleDialogColorApply}
                        field={field}
                        extraSettings={{
                            numericDimensionByGradient: state.settings.isContinuous,
                            extraDistinctsForDiscreteMode: extraDistincts,
                        }}
                        qa={DialogFieldBackgroundSettingsQa.ButtonColorDialog}
                    />
                }
            />
            {selectedRadioButton === BackgroundColorMode.Gradient && (
                <DialogFieldRow
                    title={i18n('wizard', 'label_nulls')}
                    setting={
                        <RadioButton
                            disabled={!state.enabled}
                            value={nullMode ?? GradientNullModes.Ignore}
                            onUpdate={handleNullModeUpdate}
                            qa={DialogFieldBackgroundSettingsQa.NullModeRadioButtons}
                        >
                            {NULLS_OPTIONS.map((option) => (
                                <RadioButton.Option key={option.value} value={option.value}>
                                    {option.content}
                                </RadioButton.Option>
                            ))}
                        </RadioButton>
                    }
                />
            )}
        </div>
    );
};
