import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {DatalensGlobalState} from 'ui';
import TableWidget from 'ui/libs/DatalensChartkit/ChartKit/plugins/Table/renderer/TableWidget';

import type {QlConfigPreviewTableData} from '../../../../../shared';
import {ChartKitQlPreviewTableQa} from '../../../../../shared';
import {getTablePreviewData} from '../../store/reducers/ql';

import './PaneTablePreview.scss';

const b = block('ql-pane-table-preview');

interface PreviewTableProps {
    tablePreviewData: QlConfigPreviewTableData;
}

class PreviewTable extends React.PureComponent<PreviewTableProps> {
    render() {
        const {tablePreviewData} = this.props;
        const {columns, data} = tablePreviewData;

        return (
            <div className={b()}>
                {typeof columns === 'undefined' || typeof data === 'undefined' ? (
                    <div></div>
                ) : (
                    <TableWidget
                        qa={ChartKitQlPreviewTableQa.Widget}
                        isQlPreviewTable
                        id="ql-preview-table"
                        data={{
                            type: 'table',
                            controls: null,
                            params: {},
                            data: {
                                head: columns,
                                rows: data,
                            },
                        }}
                    />
                )}
            </div>
        );
    }
}

interface PanePreviewProps {
    paneSize: number;
    tablePreviewData: QlConfigPreviewTableData;
}

class PanePreview extends React.PureComponent<PanePreviewProps> {
    render() {
        const {...restProps} = this.props;

        return <PreviewTable {...restProps} />;
    }
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        tablePreviewData: getTablePreviewData(state),
    };
};

export default connect(makeMapStateToProps)(PanePreview);
