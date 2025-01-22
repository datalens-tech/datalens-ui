import React from 'react';

import {CHARTKIT_ERROR_CODE, ChartKitError} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import pick from 'lodash/pick';
import {Loader} from 'ui/libs/DatalensChartkit/ChartKit/components';

import {ChartQa} from '../../../../../../../shared';
import {ATTR_DATA_ELEMENT_ID} from '../../../../modules/html-generator/constants';
import Performance from '../../../../modules/perfomance';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {BlankChartWidgetProps, WidgetDimensions} from '../types';

import './BlankChartWidget.scss';

const b = block('chartkit-blank-chart-widget');

export const chartStorage = new Map<string, any>();

const BlankChartWidget = (props: BlankChartWidgetProps) => {
    const {
        id,
        onLoad,
        data: {data: originalData, config},
    } = props;

    const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [originalData, config, id]);
    Performance.mark(generatedId);

    const ref = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = React.useState<WidgetDimensions | undefined>();
    const handleResize = React.useCallback(() => {
        if (ref.current) {
            const {clientWidth: width, clientHeight: height} = ref.current;

            setDimensions({width, height});
        }
    }, []);

    const chartState = React.useRef<any>({});

    React.useEffect(() => {
        chartStorage.set(generatedId, {
            chartId: generatedId,
            getState: () => chartState.current,
            setState: (value: any, options?: {silent: boolean}) => {
                chartState.current = {...chartState.current, ...value};

                if (!options?.silent) {
                    render();
                }
            },
        });

        return () => {
            chartStorage.delete(generatedId);
        };
    }, [generatedId, dimensions]);

    const render = () => {
        if (!originalData?.render) {
            return;
        }

        if (contentRef.current && dimensions) {
            const context = chartStorage.get(generatedId);
            const content = originalData.render.call(context, dimensions);
            contentRef.current.innerHTML = String(content ?? '');
        }
    };

    React.useEffect(() => {
        if (dimensions) {
            render();
            const widgetRendering = Performance.getDuration(generatedId);
            if (onLoad && widgetRendering) {
                onLoad({widget: props.data, widgetRendering});
            }
        }
    }, [dimensions, generatedId, onLoad, props.data]);

    const handleClick = React.useCallback((event) => {
        if (originalData?.events?.click) {
            const context = chartStorage.get(generatedId);
            context.__innerHTML = ref.current?.innerHTML;
            const target = {
                [ATTR_DATA_ELEMENT_ID]: event.target.getAttribute(ATTR_DATA_ELEMENT_ID),
            };
            originalData.events.click.call(context, {
                target,
            });
        }
    }, []);

    const handleKeyDown = React.useCallback((event) => {
        if (originalData?.events?.keydown) {
            const context = chartStorage.get(generatedId);
            const eventProps = pick(event, 'which');
            originalData.events.keydown.call(context, eventProps);
        }
    }, []);

    const debuncedHandleResize = React.useMemo(() => debounce(handleResize, 100), [handleResize]);

    React.useLayoutEffect(() => {
        handleResize();
    }, [handleResize]);

    React.useEffect(() => {
        window.addEventListener('resize', debuncedHandleResize);

        return () => {
            window.removeEventListener('resize', debuncedHandleResize);
        };
    }, [debuncedHandleResize]);

    if (!originalData || (typeof originalData === 'object' && !Object.keys(originalData).length)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.NO_DATA,
        });
    }

    return (
        <div
            className={b()}
            ref={ref}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div data-qa={ChartQa.Chart} className={b('content')} ref={contentRef}>
                <Loader />
            </div>
        </div>
    );
};

export default BlankChartWidget;
