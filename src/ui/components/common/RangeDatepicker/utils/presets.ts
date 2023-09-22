import {
    DEFAULT_DATE_PRESET_TAB,
    DEFAULT_OTHERS_PRESET_TAB,
    DEFAULT_TIME_PRESET_TAB,
} from '../constants';
import type {Preset, RangeDatepickerPresetTab} from '../types';

export const getDefaultPresetTabs = (withTime?: boolean): RangeDatepickerPresetTab[] => {
    const mainPresets = withTime ? DEFAULT_TIME_PRESET_TAB : DEFAULT_DATE_PRESET_TAB;
    const otherPresets = DEFAULT_OTHERS_PRESET_TAB;

    return [mainPresets, otherPresets];
};

interface FindPresetParams {
    presetTabs: RangeDatepickerPresetTab[];
    from?: string;
    to?: string;
}

export const findPreset = ({presetTabs, from, to}: FindPresetParams) => {
    let selectedPresetIndex = -1;
    let selectedPreset: Preset | undefined;

    const selectedTabIndex = presetTabs.findIndex((presetTab) => {
        const matchedPresetIndex = presetTab.presets.findIndex(
            (preset) => preset.from === from && preset.to === to,
        );

        if (matchedPresetIndex !== -1) {
            selectedPresetIndex = matchedPresetIndex;
            selectedPreset = presetTab.presets[matchedPresetIndex];
        }

        return matchedPresetIndex !== -1;
    });

    return {
        selectedTabIndex,
        selectedPreset,
        selectedPresetIndex,
    };
};
