import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import {Table} from 'ui/components/Table/Table';
import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';

type Props = {
    data: any;
};

const TableWidget = React.forwardRef<ChartKitWidgetRef | undefined, Props>((props, _ref) => {
    console.log('TableWidget', props);

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
    };

    return <Table {...tableProps} />;
});

TableWidget.displayName = 'TableWidget';

export default TableWidget;
