import React from 'react';

import {List, useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {useRangeDatepickerPreset} from '../../RangeDatepickerProvider';
import {Preset, RangeDatepickerPresetTab} from '../../types';

const b = block('dl-range-datepicker');

const renderPresetItem = ({title}: Preset) => title;

interface TabsContentProps {
    tab: RangeDatepickerPresetTab;
    selectPreset: (preset: Preset) => void;
}

export const TabsContent: React.FC<TabsContentProps> = ({tab, selectPreset}) => {
    const mobile = useMobile();
    const {withTime, selectedPresetIndex, selectedTabIndex, presetTabs} =
        useRangeDatepickerPreset();
    const selectedTab = presetTabs[selectedTabIndex];

    return (
        <div className={b('presets-content', {'with-time': withTime, mobile})}>
            <List
                itemClassName={b('preset-item', {mobile})}
                items={tab.presets}
                selectedItemIndex={tab.id === selectedTab?.id ? selectedPresetIndex : undefined}
                filterable={false}
                virtualized={false}
                renderItem={renderPresetItem}
                onItemClick={selectPreset}
            />
        </div>
    );
};
