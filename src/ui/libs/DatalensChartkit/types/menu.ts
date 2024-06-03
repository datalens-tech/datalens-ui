import type React from 'react';

import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import type {MenuItemsIds, StringParams} from 'shared';

import type {ChartWidgetDataRef} from '../../../components/Widgets/Chart/types';
import type DatalensChartkitCustomError from '../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import type {Widget as TWidget} from './widget';

export interface MenuItem<TProviderData, TProviderProps> {
    id: MenuItemsIds;
    title: (() => string) | string;
    icon: React.ReactNode;
    isVisible: (
        data: Omit<
            MenuItemActionArgs<TProviderData, TProviderProps>,
            'event' | 'onChange' | 'anchorNode'
        >,
    ) => boolean;
    action: (data: MenuItemActionArgs<TProviderData, TProviderProps>) => void;
}

export interface MenuItemActionArgs<TProviderData, TProviderProps> {
    widget: Highcharts.Chart | null;
    widgetDataRef?: ChartWidgetDataRef;
    loadedData: (TWidget & TProviderData) | null;
    propsData: TProviderProps & {params: StringParams};
    requestId: string;
    widgetRendering: number | null;
    widgetRenderTimeRef?: React.MutableRefObject<number | null>;
    yandexMapAPIWaiting: number | null;
    error: DatalensChartkitCustomError | null;

    event: Event;
    onChange: (
        props: {params: StringParams},
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
    ) => void;
    anchorNode: Element;
}

export type MenuItems<TProviderData = unknown, TProviderProps = unknown> = MenuItem<
    TProviderData,
    TProviderProps
>[];
