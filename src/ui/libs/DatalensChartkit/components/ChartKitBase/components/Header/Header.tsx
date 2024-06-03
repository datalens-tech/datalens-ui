import React from 'react';

import block from 'bem-cn-lite';
import {isEmpty} from 'lodash';
import type {StringParams} from 'shared';

import type {
    ChartsInsightsData,
    CombinedError,
    LoadedWidget,
    LoadedWidgetData,
    OnChangeData,
} from '../../../../types';
import type {MenuItems} from '../../../../types/menu';
import {CHARTKIT_BASE_CLASSNAME} from '../../helpers';

import {ChartsInsights, MenuWithErrorBoundary} from './components';

import './Header.scss';

const b = block(CHARTKIT_BASE_CLASSNAME);

export type HeaderProps<TProviderProps = unknown, TProviderData = unknown> = {
    chartsInsightsData?: ChartsInsightsData;
    menuData: {
        isMenuAvailable: boolean;
        items: MenuItems<TProviderProps>;
        widget: LoadedWidget;
        loadedData?: LoadedWidgetData<TProviderData>;
        error: CombinedError | null;
        providerProps: TProviderProps & {params: StringParams};
        requestId: string;
        widgetRendering: number | null;
        yandexMapAPIWaiting: number | null;
        hideComments: () => void;
        drawComments: () => void;
        onChange: (
            data: OnChangeData,
            state: {forceUpdate: boolean},
            callExternalOnChange?: boolean,
            callChangeByClick?: boolean,
        ) => void;
    };
    loading?: boolean;
};

export const Header = (props: HeaderProps) => {
    const {chartsInsightsData, menuData, loading} = props;
    const canBeShownMenu = menuData.isMenuAvailable && !isEmpty(menuData.items);

    return (
        <div className={b('header')}>
            {chartsInsightsData && (
                <ChartsInsights
                    items={chartsInsightsData.items}
                    messagesByLocator={chartsInsightsData.messagesByLocator}
                    locators={chartsInsightsData.locators}
                    hidden={loading}
                />
            )}
            {canBeShownMenu && (
                <MenuWithErrorBoundary
                    items={menuData.items}
                    widget={menuData.widget}
                    loadedData={menuData.loadedData}
                    error={menuData.error}
                    propsData={menuData.providerProps}
                    requestId={menuData.requestId}
                    widgetRendering={menuData.widgetRendering}
                    yandexMapAPIWaiting={menuData.yandexMapAPIWaiting}
                    hideComments={menuData.hideComments}
                    drawComments={menuData.drawComments}
                    onChange={menuData.onChange}
                />
            )}
        </div>
    );
};
