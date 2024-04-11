import React, {useState} from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import {useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {useRangeDatepickerPreset} from '../../RangeDatepickerProvider';
import type {Action} from '../../store';
import type {Preset} from '../../types';

import {DocTooltip} from './DocTooltip';
import {TabsContent} from './TabsContent';

const b = block('dl-range-datepicker');

interface PresetsProps {
    dispatch: React.Dispatch<Action>;
}

export const Presets: React.FC<PresetsProps> = ({dispatch}) => {
    const mobile = useMobile();
    const {presetTabs, selectedTabIndex} = useRangeDatepickerPreset();
    const [activeTabIndex, setActiveTabIndex] = useState(
        selectedTabIndex === -1 ? 0 : selectedTabIndex,
    );
    const activeTab = presetTabs[activeTabIndex];

    const selectTab = React.useCallback(
        (tabId: string) => {
            const matchedTabIndex = presetTabs.findIndex(({id}) => id === tabId);

            setActiveTabIndex(matchedTabIndex);
        },
        [presetTabs],
    );

    const selectPreset = React.useCallback(
        (preset: Preset) => {
            dispatch({
                type: 'SET_FROM_TO',
                payload: {
                    selectedFrom: preset.from,
                    selectedTo: preset.to,
                    errors: [],
                    callOnUpdate: true,
                },
            });
        },
        [dispatch],
    );

    return (
        <div className={b('presets', {mobile})}>
            <div className={b('presets-header')}>
                <AdaptiveTabs
                    className={b('presets-tabs')}
                    items={presetTabs}
                    activeTab={activeTab?.id}
                    onSelectTab={selectTab}
                />
                <DocTooltip />
            </div>
            {activeTab && <TabsContent tab={activeTab} selectPreset={selectPreset} />}
        </div>
    );
};
