import React from 'react';

import {ConfigItem, ConfigItemWithTabs, PluginWidgetProps} from '@gravity-ui/dashkit';
import type {DebouncedFunc} from 'lodash';
import {StringParams} from 'shared';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';

import {ChartKitBaseOnLoadProps} from '../../../../libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {ChartsData} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import {Widget} from '../../../../libs/DatalensChartkit/types';
import {AdjustWidgetLayoutProps} from '../../utils';
import {DashkitOldMetaDataItemBase} from '../types';

export type CurrentTab = {
    id: string;
    title: string;
    description: string;
    chartId: string;
    isDefault: boolean;
    params: StringParams;
    autoHeight?: boolean;
    enableActionParams?: boolean;
};

export type WidgetPluginData = ConfigItem['data'];
export type WidgetPluginDataWithTabs = ConfigItemWithTabs['data'] & {tabs: Array<CurrentTab>};

export type WidgetPluginProps = Omit<PluginWidgetProps, 'data'> & {
    forwardedRef: React.RefObject<ChartsChartKit>;
    isNewRelations?: boolean;
    data: WidgetPluginDataWithTabs | WidgetPluginData;
    getMarkdown?: (props: {text: string}) => Promise<{result: string}>;
    debouncedAdjustWidgetLayout: DebouncedFunc<(props: AdjustWidgetLayoutProps) => void>;
};

export type WidgetLoadedData = ChartKitBaseOnLoadProps<ChartsData & Widget> & {
    data?: {loadedData?: DashkitOldMetaDataItemBase & ChartsData & Widget};
};
