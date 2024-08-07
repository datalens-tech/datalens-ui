import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import type {StringParams} from 'shared';
import {ChartKitTableQa} from 'shared';
import Loader from 'ui/units/dash/components/Loader/Loader';

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
        } = props;

        const generatedId = React.useMemo(
            () => `${id}_${getRandomCKId()}`,
            [originalData, config, id],
        );
        Performance.mark(generatedId);

        const ref = React.useRef<HTMLDivElement | null>(null);
        const [dimensions, setDimensions] = React.useState<Partial<WidgetDimensions>>();
        const handleResize = React.useCallback(() => {
            if (ref.current) {
                const {width, height} = ref.current.getBoundingClientRect();
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

        React.useLayoutEffect(() => {
            if (!dimensions?.width) {
                return;
            }

            const widgetRendering = Performance.getDuration(generatedId);

            if (onLoad && widgetRendering) {
                onLoad({widget: props.data, widgetRendering});
            }
        }, [generatedId, onLoad, dimensions, props.data]);

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
                    />
                ) : (
                    <Loader />
                )}
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
