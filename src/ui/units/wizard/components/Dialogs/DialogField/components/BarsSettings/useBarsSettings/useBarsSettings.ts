import React from 'react';

import type {
    BarAutoScaleSettings,
    BarGradientColorSettings,
    BarManualScaleSettings,
    BarOneColorSettings,
    BarTwoColorSettings,
    TableBarsSettings,
} from 'shared';

import {absurd} from '../../../../../../../../utils';

import {
    getDefaultGradientColorSettings,
    getDefaultOneColorSettings,
    getDefaultTwoColorSettings,
} from './helpers';

type UseBarsSettingsArgs = {
    state: TableBarsSettings;
    onUpdate: (config: Partial<TableBarsSettings>) => void;
};

export const useBarsSettings = (args: UseBarsSettingsArgs) => {
    const {state, onUpdate} = args;

    const handleEnabledUpdate = React.useCallback(
        (enabled: boolean) => {
            onUpdate({enabled});
        },
        [onUpdate],
    );

    const handleShowLabelsUpdate = React.useCallback(
        (showLabels: boolean) => {
            onUpdate({showLabels});
        },
        [onUpdate],
    );

    const handleScaleUpdate = React.useCallback(
        (scaleType: TableBarsSettings['scale']['mode']) => {
            let scale: BarAutoScaleSettings | BarManualScaleSettings;
            switch (scaleType) {
                case 'auto':
                    scale = {mode: 'auto'};
                    break;
                case 'manual':
                    scale = {mode: 'manual', settings: {min: '', max: ''}};
                    break;
                default:
                    absurd(scaleType as never);
            }
            onUpdate({scale});
        },
        [onUpdate],
    );

    const handleScaleValuesUpdate = React.useCallback(
        (scaleValues: BarManualScaleSettings['settings']) => {
            onUpdate({
                scale: {
                    ...state.scale,
                    settings: {
                        ...(state.scale as BarManualScaleSettings).settings,
                        ...scaleValues,
                    },
                } as BarManualScaleSettings,
            });
        },
        [state.scale, onUpdate],
    );

    const handleAlignUpdate = React.useCallback(
        (align: TableBarsSettings['align']) => {
            onUpdate({align});
        },
        [onUpdate],
    );

    const handleColorUpdate = React.useCallback(
        (colorSettings: Partial<TableBarsSettings['colorSettings']['settings']>) => {
            onUpdate({
                colorSettings: {
                    ...state.colorSettings,
                    settings: {...state.colorSettings.settings, ...colorSettings},
                } as TableBarsSettings['colorSettings'],
            });
        },
        [state.colorSettings, onUpdate],
    );

    const handleFillColorUpdate = React.useCallback(
        (colorType: TableBarsSettings['colorSettings']['colorType']) => {
            if (colorType === state.colorSettings.colorType) {
                return;
            }

            let colorSettings: BarGradientColorSettings | BarOneColorSettings | BarTwoColorSettings;

            switch (colorType) {
                case 'gradient':
                    colorSettings = getDefaultGradientColorSettings();
                    break;
                case 'two-color':
                    colorSettings = getDefaultTwoColorSettings();
                    break;
                case 'one-color':
                    colorSettings = getDefaultOneColorSettings();
                    break;
                default:
                    absurd(colorType as never);
            }

            onUpdate({colorSettings});
        },
        [state.colorSettings.colorType, onUpdate],
    );

    const handleShowBarsInTotalsUpdate = React.useCallback(
        (showBarsInTotals: boolean) => {
            onUpdate({showBarsInTotals});
        },
        [onUpdate],
    );

    return {
        handleAlignUpdate,
        handleColorUpdate,
        handleFillColorUpdate,
        handleEnabledUpdate,
        handleScaleUpdate,
        handleScaleValuesUpdate,
        handleShowLabelsUpdate,
        handleShowBarsInTotalsUpdate,
    };
};
