import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {createStructuredSelector} from 'reselect';
import {
    changeAmountPreviewRows,
    refetchPreviewDataset,
    toggleViewPreview,
} from 'units/datasets/store/actions/creators';

import PreviewHeader from '../../components/PreviewHeader/PreviewHeader';
import PreviewTable from '../../components/PreviewTable/PreviewTable';
import {datasetPreviewErrorSelector, datasetPreviewSelector} from '../../store/selectors/dataset';

import './DatasetPreview.scss';

const b = block('dataset-preview');

class DatasetPreview extends React.Component {
    render() {
        const {
            datasetPreview,
            previewError,
            datasetPreview: {view, amountPreviewRows} = {},
            toggleViewPreview,
            changeAmountPreviewRows,
            refetchPreviewDataset,
            closePreview,
        } = this.props;

        return (
            <div className={b()}>
                <PreviewHeader
                    view={view}
                    amountPreviewRows={amountPreviewRows}
                    toggleViewPreview={toggleViewPreview}
                    closePreview={closePreview}
                    changeAmountPreviewRows={changeAmountPreviewRows}
                    refetchPreviewDataset={refetchPreviewDataset}
                />
                <PreviewTable view={view} preview={datasetPreview} error={previewError} />
            </div>
        );
    }
}

DatasetPreview.propTypes = {
    datasetPreview: PropTypes.object.isRequired,
    previewError: PropTypes.object,
    toggleViewPreview: PropTypes.func.isRequired,
    closePreview: PropTypes.func.isRequired,
    changeAmountPreviewRows: PropTypes.func.isRequired,
    refetchPreviewDataset: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
    datasetPreview: datasetPreviewSelector,
    previewError: datasetPreviewErrorSelector,
});
const mapDispatchToProps = {
    toggleViewPreview,
    changeAmountPreviewRows,
    refetchPreviewDataset,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(DatasetPreview);
