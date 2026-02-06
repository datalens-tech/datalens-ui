import React from 'react';

import block from 'bem-cn-lite';
import throttle from 'lodash/throttle';
import {useDispatch, useSelector} from 'react-redux';
import {
    changeAmountPreviewRows,
    refetchPreviewDataset,
    toggleViewPreview,
} from 'units/datasets/store/actions/creators';

import {
    ChartKitTooltip,
    type ChartKitTooltipRef,
} from '../../../../libs/DatalensChartkit/ChartKit/components';
import PreviewHeader from '../../components/PreviewHeader/PreviewHeader';
import PreviewTable from '../../components/PreviewTable/PreviewTable';
import {datasetPreviewErrorSelector, datasetPreviewSelector} from '../../store/selectors/dataset';

import './DatasetPreview.scss';

const b = block('dataset-preview');

type Props = {
    previewError?: Object;
    closePreview: () => void;
};

const DatasetPreview = (props: Props) => {
    const dispatch = useDispatch();

    const {closePreview} = props;

    const datasetPreview = useSelector(datasetPreviewSelector);
    const previewError = useSelector(datasetPreviewErrorSelector);

    const {view, amountPreviewRows} = datasetPreview;

    const rootNodeRef = React.useRef<HTMLDivElement | null>(null);
    const tooltipRef = React.useRef<ChartKitTooltipRef | null>(null);

    const handleContainerMousemove = React.useCallback((e) => {
        tooltipRef.current?.checkForTooltipNode(e);
    }, []);

    const handleToggleViewPreview = React.useCallback(
        (args) => {
            return dispatch(toggleViewPreview(args));
        },
        [dispatch],
    );

    const handleChangeAmountPreviewRows = React.useCallback(
        (args) => {
            return dispatch(changeAmountPreviewRows(args));
        },
        [dispatch],
    );

    const handleRefetchPreviewDataset = React.useCallback(() => {
        return dispatch(refetchPreviewDataset());
    }, [dispatch]);

    React.useEffect(() => {
        const throttledHandler = throttle(handleContainerMousemove, 200);
        const container = rootNodeRef.current;

        if (container) {
            rootNodeRef.current?.addEventListener('mousemove', throttledHandler);
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
                toggleViewPreview={handleToggleViewPreview}
                closePreview={closePreview}
                changeAmountPreviewRows={handleChangeAmountPreviewRows}
                refetchPreviewDataset={handleRefetchPreviewDataset}
            />
            <PreviewTable view={view} preview={datasetPreview} error={previewError} />
            <ChartKitTooltip ref={tooltipRef} />
        </div>
    );
};

DatasetPreview.displayName = 'DatasetPreview';

export default React.memo(DatasetPreview);
