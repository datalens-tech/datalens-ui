import React from 'react';

import block from 'bem-cn-lite';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {createStructuredSelector} from 'reselect';
import {
    changeAmountPreviewRows,
    refetchPreviewDataset,
    toggleViewPreview,
} from 'units/datasets/store/actions/creators';

import {ChartKitTooltip} from '../../../../libs/DatalensChartkit/ChartKit/components';
import PreviewHeader from '../../components/PreviewHeader/PreviewHeader';
import PreviewTable from '../../components/PreviewTable/PreviewTable';
import {datasetPreviewErrorSelector, datasetPreviewSelector} from '../../store/selectors/dataset';

import './DatasetPreview.scss';

const b = block('dataset-preview');

const DatasetPreview = (props) => {
    const {
        datasetPreview,
        previewError,
        datasetPreview: {view, amountPreviewRows} = {},
        toggleViewPreview,
        changeAmountPreviewRows,
        refetchPreviewDataset,
        closePreview,
    } = props;

    const rootNodeRef = React.useRef(null);
    const tooltipRef = React.useRef(null);

    const handleContainerMousemove = React.useCallback((e) => {
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
        <div className={b()} ref={rootNodeRef}>
            <PreviewHeader
                view={view}
                amountPreviewRows={amountPreviewRows}
                toggleViewPreview={toggleViewPreview}
                closePreview={closePreview}
                changeAmountPreviewRows={changeAmountPreviewRows}
                refetchPreviewDataset={refetchPreviewDataset}
            />
            <PreviewTable view={view} preview={datasetPreview} error={previewError} />
            <ChartKitTooltip ref={tooltipRef} />
        </div>
    );
};

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
