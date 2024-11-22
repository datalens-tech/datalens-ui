import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import type {StringParams} from 'shared';
import {ChartKitTableQa} from 'shared';

import {getRandomCKId} from '../../../helpers/getRandomCKId';
import Performance from '../../../modules/perfomance';
import type {WidgetDimensions} from '../renderer/types';
import type {TableWidgetProps} from '../types';

import {Table} from './components/Table/Table';

import './TableWidget.scss';

const b = block('chartkit-table-widget');

const TableWidget = React.forwardRef<ChartKitWidgetRef | undefined, TableWidgetProps>(
    (props, forwardedRef) => {
        const {
            id,
            onChange,
            onLoad,
            data: {data: originalData, config},
            backgroundColor,
        } = props;

        const generatedId = React.useMemo(
            () => `${id}_${getRandomCKId()}`,
            [originalData, config, id],
        );
        Performance.mark(generatedId);

        const ref = React.useRef<HTMLDivElement | null>(null);
        const [dimensions, setDimensions] = React.useState<WidgetDimensions | undefined>();
        const handleResize = React.useCallback(() => {
            if (ref.current) {
                const {clientWidth: width, clientHeight: height} = ref.current;

                setDimensions({width, height});
            }
        }, []);

        const debuncedHandleResize = React.useMemo(
            () => debounce(handleResize, 100),
            [handleResize],
        );

        React.useLayoutEffect(() => {
            handleResize();
        }, [handleResize]);

        React.useImperativeHandle(
            forwardedRef,
            () => ({
                reflow() {
                    debuncedHandleResize();
                },
            }),
            [debuncedHandleResize],
        );

        React.useEffect(() => {
            window.addEventListener('resize', debuncedHandleResize);

            return () => {
                window.removeEventListener('resize', debuncedHandleResize);
            };
        }, [debuncedHandleResize]);

        const handleTableReady = React.useCallback(() => {
            const widgetRendering = Performance.getDuration(generatedId);

            if (onLoad && widgetRendering) {
                onLoad({widget: props.data, widgetRendering});
            }
        }, [generatedId, onLoad, props.data]);

        const handleChangeParams = React.useCallback(
            (params: StringParams) => {
                if (onChange) {
                    onChange({type: 'PARAMS_CHANGED', data: {params}}, {forceUpdate: true}, true);
                }
            },
            [onChange],
        );

        return (
            <div className={b()} data-qa={ChartKitTableQa.Widget} ref={ref}>
                {dimensions ? (
                    <Table
                        widgetData={props.data}
                        dimensions={dimensions}
                        onChangeParams={handleChangeParams}
                        onReady={handleTableReady}
                        backgroundColor={backgroundColor}
                    />
                ) : (
                    <Loader />
                )}
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default React.memo<TableWidgetProps>(TableWidget);
