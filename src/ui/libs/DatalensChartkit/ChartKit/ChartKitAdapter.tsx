import React from 'react';

import type {ChartKitLang, ChartKitProps, ChartKitRef} from '@gravity-ui/chartkit';
import OpensourceChartKit, {settings} from '@gravity-ui/chartkit';
import {ErrorBoundary} from 'ui/components/ErrorBoundary/ErrorBoundary';

import {registry} from '../../../registry';
import {ChartkitError} from '../components/ChartKitBase/components/ChartkitError/ChartkitError';
import DatalensChartkitCustomError from '../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import {ChartKit} from './ChartKit';
import {getAdditionalProps, getOpensourceChartKitData} from './helpers/chartkit-adapter';
import {I18N as modulesI18n} from './modules/i18n/i18n';
import type {ChartKitAdapterProps} from './types';

const ChartkitWidget = React.forwardRef<ChartKit, ChartKitAdapterProps>((props, ref) => {
    const {
        loadedData,
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
        paneSplitOrientation,
    } = props;

    const chartkitType = React.useMemo(() => {
        const getChartkitType = registry.chart.functions.get('getChartkitType');
        return getChartkitType(loadedData);
    }, [loadedData]);

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
            paneSplitOrientation,
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
        paneSplitOrientation,
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
            paneSplitOrientation={paneSplitOrientation}
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
