import type React from 'react';

import type {ConfigItem, ConfigItemWithTabs, PluginWidgetProps} from '@gravity-ui/dashkit';
import type {DebouncedFunc} from 'lodash';
import type {StringParams} from 'shared';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';

import type {ChartKitBaseOnLoadProps} from '../../../../libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import type {ChartsData} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import type {Widget} from '../../../../libs/DatalensChartkit/types';
import type {AdjustWidgetLayoutProps} from '../../utils';
import type {DashkitOldMetaDataItemBase} from '../types';

export type CurrentTab = {
    id: string;
    title: string;
    description: string;
    displayedTitle?: string | React.ReactNode;
    hint?: string;
    enableHint?: boolean;
    enableDescription?: boolean;
    chartId: string;
    isDefault: boolean;
    params: StringParams;
    autoHeight?: boolean;
    enableActionParams?: boolean;
    background?: {
        enabled?: boolean;
        color: string;
    };
};

export type WidgetPluginData = ConfigItem['data'];
export type WidgetPluginDataWithTabs = ConfigItemWithTabs['data'] & {tabs: Array<CurrentTab>};

export type WidgetPluginProps = Omit<PluginWidgetProps, 'data'> & {
    forwardedRef: React.RefObject<ChartsChartKit>;
    isNewRelations?: boolean;
    data: WidgetPluginDataWithTabs | WidgetPluginData;
    getMarkdown?: (props: {text: string}) => Promise<{result: string; meta?: object}>;
    debouncedAdjustWidgetLayout: DebouncedFunc<(props: AdjustWidgetLayoutProps) => void>;
};

export type WidgetLoadedData = ChartKitBaseOnLoadProps<ChartsData & Widget> & {
    data?: {loadedData?: DashkitOldMetaDataItemBase & ChartsData & Widget};
};
