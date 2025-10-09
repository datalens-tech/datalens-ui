import React from 'react';

import type {ChartKitLang, ChartKitProps, ChartKitRef} from '@gravity-ui/chartkit';
import OpensourceChartKit, {settings} from '@gravity-ui/chartkit';
import throttle from 'lodash/throttle';
import {ErrorBoundary} from 'ui/components/ErrorBoundary/ErrorBoundary';
import {useGetChartkitHolidaysAsyncQuery} from 'ui/store/toolkit';

import {registry} from '../../../registry';
import {ChartkitError} from '../components/ChartKitBase/components/ChartkitError/ChartkitError';
import DatalensChartkitCustomError from '../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import {ChartKit} from './ChartKit';
import {ChartKitTooltip} from './components';
import type {ChartKitTooltipRef} from './components';
import {getAdditionalProps, getOpensourceChartKitData} from './helpers/chartkit-adapter';
import {I18N as modulesI18n} from './modules/i18n/i18n';
import type {ChartKitAdapterProps} from './types';

type ChartkitWidgetProps = Omit<ChartKitAdapterProps, 'rootNodeRef'>;

const ChartkitWidget = React.forwardRef<ChartKit | ChartKitRef | undefined, ChartkitWidgetProps>(
    (props, ref) => {
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
            widgetDashState,
            backgroundColor,
        } = props;

        const {data: chartkitHolidays} = useGetChartkitHolidaysAsyncQuery();

        const chartkitType = React.useMemo(() => {
            const getChartkitType = registry.chart.functions.get('getChartkitType');
            return getChartkitType(loadedData);
        }, [loadedData]);

        const opensourceChartKitProps = React.useMemo(() => {
            const getFormatNumber = registry.common.functions.get('getFormatNumber');
            const {getChartkitPlugins} = registry.chart.functions.getAll();

            if (!chartkitType) {
                return undefined;
            }

            settings.set({
                plugins: getChartkitPlugins(),
                extra: {holidays: chartkitHolidays},
            });

            const additionalProps = getAdditionalProps({type: chartkitType, splitTooltip});

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
                widgetDashState,
                backgroundColor,
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
            widgetDashState,
            backgroundColor,
            chartkitHolidays,
        ]);

        React.useEffect(() => {
            if (lang) {
                settings.set({lang: lang as ChartKitLang});
                modulesI18n.setLang(lang);
            }
        }, [lang]);

        if (opensourceChartKitProps) {
            return <OpensourceChartKit {...opensourceChartKitProps} ref={ref} />;
        }

        return (
            <ChartKit
                // ref is mainly used to access the reflow method
                // undefined can only be passed in the os version of chartkit
                ref={ref as React.ForwardedRef<ChartKit>}
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
                widgetDashState={widgetDashState}
                backgroundColor={backgroundColor}
            />
        );
    },
);
ChartkitWidget.displayName = 'ChartkitWidget';

export const ChartKitAdapter = React.forwardRef<
    ChartKit | ChartKitRef | undefined,
    ChartKitAdapterProps
>((props, ref) => {
    const {rootNodeRef, ...restProps} = props;
    const tooltipRef = React.useRef<ChartKitTooltipRef>(null);

    const handleContainerMousemove = React.useCallback((e: MouseEvent) => {
        tooltipRef.current?.checkForTooltipNode(e);
    }, []);

    React.useEffect(() => {
        const throttledHandler = throttle(handleContainerMousemove, 200);
        const container = rootNodeRef.current;

        if (container) {
            rootNodeRef.current.addEventListener('mousemove', throttledHandler);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', throttledHandler);
            }
        };
    }, [rootNodeRef, handleContainerMousemove]);

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
            <ChartkitWidget ref={ref} {...restProps} />
            <ChartKitTooltip ref={tooltipRef} />
        </ErrorBoundary>
    );
});

ChartKitAdapter.displayName = 'ChartKitAdapter';
