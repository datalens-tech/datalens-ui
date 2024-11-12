import React from 'react';

import {CHARTKIT_ERROR_CODE, ChartKitError} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import {Loader} from 'ui/libs/DatalensChartkit/ChartKit/components';

import {ChartQa} from '../../../../../../../shared';
import Performance from '../../../../modules/perfomance';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {BlankChartWidgetProps, WidgetDimensions} from '../types';

import './BlankChartWidget.scss';

const b = block('chartkit-blank-chart-widget');

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

    React.useEffect(() => {
        if (dimensions && originalData?.render) {
            const content = originalData.render({...dimensions});
            if (contentRef.current) {
                contentRef.current.innerHTML = content ?? '';

                const widgetRendering = Performance.getDuration(generatedId);
                if (onLoad && widgetRendering) {
                    onLoad({widget: props.data, widgetRendering});
                }
            }
        }
    }, [dimensions, generatedId, onLoad, originalData, props.data]);

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
        <div className={b()} ref={ref}>
            <div data-qa={ChartQa.Chart} className={b('content')} ref={contentRef}>
                <Loader />
            </div>
        </div>
    );
};

export default BlankChartWidget;
