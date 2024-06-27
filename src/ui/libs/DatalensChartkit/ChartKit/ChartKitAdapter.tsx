import React from 'react';

import type {ChartKitLang, ChartKitProps, ChartKitRef, ChartKitType} from '@gravity-ui/chartkit';
import OpensourceChartKit, {settings} from '@gravity-ui/chartkit';
import get from 'lodash/get';
import type {TableHead} from 'shared';
import {ErrorBoundary} from 'ui/components/ErrorBoundary/ErrorBoundary';

import {registry} from '../../../registry';
import {ChartkitError} from '../components/ChartKitBase/components/ChartkitError/ChartkitError';
import DatalensChartkitCustomError from '../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import type {LoadedWidgetData} from '../types';

import {ChartKit} from './ChartKit';
import {getAdditionalProps, getOpensourceChartKitData} from './helpers/chartkit-adapter';
import {I18N as modulesI18n} from './modules/i18n/i18n';
import type {TableWidgetProps} from './plugins/Table/types';
import type {ChartKitAdapterProps} from './types';

/**
 * Temporary hook for preparing `loadedData` that will being sharing between OS ChartKit and local ChartKit
 */
const useLoadedData = (props: {chartkitType?: ChartKitType; loadedData?: LoadedWidgetData}) => {
    const loadedData = React.useMemo(() => {
        if (props.chartkitType === 'table') {
            const data = (props.loadedData || {}) as TableWidgetProps['data'];
            const head = get(data, ['data', 'head'], []) as TableHead[];
            const hasGroups = head.some((th) => get(th, 'group', false));

            if (data?.config && typeof data?.config?.settings?.highlightRows === 'undefined') {
                data.config.settings = {
                    ...data.config.settings,
                    highlightRows: !hasGroups,
                };
            }
        }

        return props.loadedData;
    }, [props.chartkitType, props.loadedData]);

    return {loadedData};
};

const ChartkitWidget = React.forwardRef<ChartKit, ChartKitAdapterProps>((props, ref) => {
    const {
        lang,
        isMobile,
        splitTooltip,
        nonBodyScroll,
        onLoad,
        onError,
        onChange,
        onRender,
        onChartLoad,
        renderPluginLoader,
    } = props;

    const chartkitType = React.useMemo(() => {
        const getChartkitType = registry.chart.functions.get('getChartkitType');
        return getChartkitType(props.loadedData);
    }, [props.loadedData]);
    const {loadedData} = useLoadedData({chartkitType, loadedData: props.loadedData});
    const opensourceChartKitProps = React.useMemo(() => {
        const getFormatNumber = registry.common.functions.get('getFormatNumber');
        const {getChartkitHolidays, getChartkitPlugins} = registry.chart.functions.getAll();

        if (!chartkitType) {
            return undefined;
        }

        const holidays = getChartkitHolidays();

        settings.set({
            plugins: getChartkitPlugins(),
            extra: {holidays},
        });

        const additionalProps = getAdditionalProps(chartkitType);

        return {
            type: chartkitType,
            data: getOpensourceChartKitData({type: chartkitType, loadedData, onChange}),
            lang,
            splitTooltip,
            isMobile,
            formatNumber: getFormatNumber,
            onChange,
            onLoad: onLoad as ChartKitProps<typeof chartkitType>['onLoad'],
            onChartLoad,
            onRender,
            onError,
            renderPluginLoader,
            ...additionalProps,
        } as ChartKitProps<typeof chartkitType>;
    }, [
        onChange,
        onLoad,
        onChartLoad,
        onRender,
        onError,
        renderPluginLoader,
        lang,
        loadedData,
        splitTooltip,
        isMobile,
        chartkitType,
    ]);

    React.useEffect(() => {
        if (lang) {
            settings.set({lang: lang as ChartKitLang});
            modulesI18n.setLang(lang);
        }
    }, [lang]);

    if (opensourceChartKitProps) {
        return (
            <OpensourceChartKit
                {...opensourceChartKitProps}
                ref={ref as React.ForwardedRef<ChartKitRef | undefined>}
            />
        );
    }

    return (
        <ChartKit
            ref={ref}
            loadedData={loadedData}
            lang={lang}
            isMobile={isMobile}
            splitTooltip={splitTooltip}
            nonBodyScroll={nonBodyScroll}
            onLoad={onLoad}
            onChartLoad={onChartLoad}
            onRender={onRender}
            onError={onError}
            onChange={onChange}
        />
    );
});
ChartkitWidget.displayName = 'ChartkitWidget';

export const ChartKitAdapter = React.forwardRef<ChartKit, ChartKitAdapterProps>((props, ref) => {
    return (
        <ErrorBoundary
            onError={(error) => {
                if (props.onError) {
                    props.onError?.({error: DatalensChartkitCustomError.wrap(error)});
                }
            }}
            renderError={(error) => (
                <ChartkitError
                    requestId={props.requestId || ''}
                    noControls={props.noControls}
                    error={error}
                />
            )}
        >
            <ChartkitWidget ref={ref} {...props} />
        </ErrorBoundary>
    );
});

ChartKitAdapter.displayName = 'ChartKitAdapter';
