import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import {Table} from 'ui/components/Table/Table';
import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';

import './TableWidget.scss';

const b = block('chartkit-table-widget');

type Props = {
    data: any;
    onChange?: () => void;
};

type WidgetSize = {
    width: number;
    height: number;
};

const TableWidget = React.forwardRef<ChartKitWidgetRef | undefined, Props>(
    (props, forwardedRef) => {
        const ref = React.useRef<HTMLDivElement>(null);
        const [widgetSize, setWidgetSize] = React.useState<WidgetSize>();
        const handleResize = React.useCallback(() => {
            const parentElement = ref.current?.parentElement;

            if (parentElement) {
                const {width, height} = parentElement.getBoundingClientRect();
                setWidgetSize({width, height});
            }
        }, []);

        React.useImperativeHandle(
            forwardedRef,
            () => ({
                reflow() {
                    handleResize();
                },
            }),
            [handleResize],
        );

        React.useEffect(() => {
            handleResize();
        }, [handleResize]);

        const tableProps = {
            data: props.data.data,
            title: props.data.config.title ? {text: props.data.config.title} : undefined,
            pagination: {
                enabled: props.data.config.paginator.enabled,
                pageSize: props.data.config.paginator.limit,
                pageIndex: Number(props.data.params._page) || 0,
            },
            onChange: props.onChange,
            emptyDataMsg: i18n('chartkit-table', 'message-no-data'),
            ...widgetSize,
        };

        return (
            <div className={b()} ref={ref}>
                {widgetSize && <Table {...tableProps} />}
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
