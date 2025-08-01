import React from 'react';

import type {SegmentedRadioGroupOptionProps} from '@gravity-ui/uikit';
import {Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useSelector} from 'react-redux';
import type {Field, TableBarsSettings} from 'shared';
import {BarsAlignValues, BarsColorType, DialogFieldBarsSettingsQa} from 'shared';
import {selectColorPalettes} from 'ui/store/selectors/colorPaletteEditor';

import {DialogRadioButtons} from '../../../components/DialogRadioButtons/DialogRadioButtons';
import {DialogFieldRow} from '../DialogFieldRow/DialogFieldRow';

import {ColorsControl} from './components/ColorControls/ColorsControl';
import {MinMaxInputs} from './components/MinMaxInputs/MinMaxInputs';
import {useBarsSettings} from './useBarsSettings/useBarsSettings';

export type BarsSettingsProps = {
    field: Field;
    state: TableBarsSettings;
    onUpdate: (config: Partial<TableBarsSettings>) => void;
    onError: (error: boolean) => void;
};

const b = block('bars-settings-section');

const COLOR_TYPE_RADIO_ITEMS: SegmentedRadioGroupOptionProps[] = [
    {
        content: i18n('wizard', 'label_one-color'),
        value: BarsColorType.OneColor,
    },
    {
        content: i18n('wizard', 'label_two-color'),
        value: BarsColorType.TwoColor,
    },
    {
        content: i18n('wizard', 'label_gradient'),
        value: BarsColorType.Gradient,
    },
];
const ALIGN_RADIO_ITEMS: SegmentedRadioGroupOptionProps[] = [
    {
        content: i18n('wizard', 'label_default'),
        value: BarsAlignValues.Default,
    },
    {
        content: i18n('wizard', 'label_bars-align-left'),
        value: BarsAlignValues.Left,
    },
    {
        content: i18n('wizard', 'label_bars-align-right'),
        value: BarsAlignValues.Right,
    },
];

const SCALE_RADIO_ITEMS: SegmentedRadioGroupOptionProps[] = [
    {
        content: i18n('wizard', 'label_auto'),
        value: 'auto',
    },
    {
        content: i18n('wizard', 'label_manual'),
        value: 'manual',
    },
];

export const BarsSettings: React.FC<BarsSettingsProps> = (props: BarsSettingsProps) => {
    const {state, onUpdate, onError, field} = props;
    const colorPalettes = useSelector(selectColorPalettes);

    const {
        handleAlignUpdate,
        handleColorUpdate,
        handleScaleUpdate,
        handleScaleValuesUpdate,
        handleFillColorUpdate,
        handleEnabledUpdate,
        handleShowLabelsUpdate,
        handleShowBarsInTotalsUpdate,
    } = useBarsSettings({state, onUpdate});

    const handlePaletteUpdate = React.useCallback(
        (palette: string) => {
            let updateParams: Partial<TableBarsSettings['colorSettings']['settings']> = {palette};

            switch (state.colorSettings.colorType) {
                case BarsColorType.OneColor: {
                    updateParams = {
                        ...updateParams,
                        colorIndex: 0,
                    };
                    break;
                }
                case BarsColorType.TwoColor: {
                    updateParams = {
                        ...updateParams,
                        positiveColorIndex: 0,
                        negativeColorIndex: 1,
                    };
                    break;
                }
            }

            handleColorUpdate(updateParams);
        },
        [handleColorUpdate, state.colorSettings.colorType],
    );

    return (
        <div className={b()}>
            <DialogFieldRow
                title={i18n('wizard', 'label_bars-switcher')}
                setting={
                    <Switch
                        qa={DialogFieldBarsSettingsQa.EnableButton}
                        checked={state.enabled}
                        onUpdate={handleEnabledUpdate}
                    />
                }
            />
            <DialogFieldRow
                title={i18n('wizard', 'label_fill-color-type')}
                setting={
                    <DialogRadioButtons
                        qa={DialogFieldBarsSettingsQa.ColorTypeRadioButtons}
                        disabled={!state.enabled}
                        items={COLOR_TYPE_RADIO_ITEMS}
                        value={state.colorSettings.colorType}
                        onUpdate={(v) => handleFillColorUpdate(v as BarsColorType)}
                    />
                }
            />
            <ColorsControl
                field={field}
                onUpdateColor={handleColorUpdate}
                onUpdatePalette={handlePaletteUpdate}
                colorSettings={state.colorSettings}
                disabled={!state.enabled}
                onError={onError}
                colorPalettes={colorPalettes}
            />
            <DialogFieldRow
                title={i18n('wizard', 'label_bars-labels')}
                setting={
                    <Switch
                        disabled={!state.enabled}
                        qa={DialogFieldBarsSettingsQa.EnableLabelsButton}
                        checked={state.showLabels}
                        onUpdate={handleShowLabelsUpdate}
                    />
                }
            />
            <DialogFieldRow
                title={i18n('wizard', 'label_bars-in-totals')}
                setting={
                    <Switch
                        disabled={!state.enabled}
                        qa={DialogFieldBarsSettingsQa.EnableBarsInTotalsButton}
                        checked={state.showBarsInTotals}
                        onUpdate={handleShowBarsInTotalsUpdate}
                    />
                }
            />
            <DialogFieldRow
                title={i18n('wizard', 'label_bars-align')}
                tooltipText={i18n('wizard', 'label_bars-align-info')}
                setting={
                    <DialogRadioButtons
                        stretched={true}
                        disabled={!state.enabled}
                        items={ALIGN_RADIO_ITEMS}
                        value={state.align}
                        onUpdate={(v) => handleAlignUpdate(v as BarsAlignValues)}
                    />
                }
            />
            <DialogFieldRow
                title={i18n('wizard', 'label_bars-scale')}
                setting={
                    <DialogRadioButtons
                        qa={DialogFieldBarsSettingsQa.ScaleModeRadioButtons}
                        stretched={true}
                        items={SCALE_RADIO_ITEMS}
                        value={state.scale.mode}
                        onUpdate={(v) => handleScaleUpdate(v as 'auto' | 'manual')}
                        disabled={!state.enabled}
                    />
                }
            />
            <DialogFieldRow
                title={''}
                customMarginBottom="12px"
                setting={
                    <MinMaxInputs
                        qa={DialogFieldBarsSettingsQa.ScaleInputsWrapper}
                        min={state.scale.mode === 'manual' ? state.scale.settings.min : ''}
                        max={state.scale.mode === 'manual' ? state.scale.settings.max : ''}
                        disabled={state.scale.mode === 'auto'}
                        onUpdate={handleScaleValuesUpdate}
                        validatePoints="2-point"
                        onError={onError}
                    />
                }
            />
        </div>
    );
};
