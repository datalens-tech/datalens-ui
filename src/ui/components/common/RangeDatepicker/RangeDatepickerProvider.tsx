import {createContext, useContext} from 'react';

import type {Preset, RangeDatepickerPresetTab} from './types';

export interface RangeDatepickerPresetValue {
    presetTabs: RangeDatepickerPresetTab[];
    withTime: boolean;
    selectedTabIndex: number;
    selectedPreset: Preset | undefined;
    selectedPresetIndex: number;
}

const RangeDatepickerPresetContext = createContext<RangeDatepickerPresetValue | null>(null);

export const RangeDatepickerPresetProvider = RangeDatepickerPresetContext.Provider;

export const useRangeDatepickerPreset = () =>
    useContext(RangeDatepickerPresetContext) as RangeDatepickerPresetValue;
