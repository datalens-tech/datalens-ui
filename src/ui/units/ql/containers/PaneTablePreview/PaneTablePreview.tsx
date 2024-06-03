import React from 'react';

import DataTable from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import _ from 'lodash';
import {connect} from 'react-redux';
import type {DatalensGlobalState} from 'ui';

import type {QlConfigPreviewTableData} from '../../../../../shared';
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
                    <DataTable
                        columns={columns}
                        data={data}
                        emptyDataMessage={i18n('dataset.dataset-editor.modify', 'label_no-data')}
                        settings={{
                            highlightRows: true,
                            stripedRows: false,
                            displayIndices: false,
                            dynamicRender: true,
                        }}
                        rowClassName={() => b('row')}
                        theme={'preview-dataset'}
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
