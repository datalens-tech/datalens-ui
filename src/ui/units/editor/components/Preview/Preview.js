import React from 'react';
import {useDispatch} from 'react-redux';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {useLocation} from 'react-router-dom';
import {MenuType} from 'ui/libs/DatalensChartkit/menu/constants';

import {ChartWrapper} from '../../../../components/Widgets/Chart/ChartWidgetWithProvider';
import {URL_QUERY} from '../../../../constants';
import Utils, {UrlSearch} from '../../../../utils';
import {Status} from '../../constants/common';
import {drawPreview} from '../../store/actions';

import './Preview.scss';

const b = block('chart-preview');

const Preview = ({
    chartData,
    onLoadData,
    queryParams,
    widgetRef,
    actionParamsEnabled,
    workbookId,
}) => {
    const onLoad = (result) => {
        const status = result.status === Status.Success ? Status.Success : Status.Failed;
        onLoadData({data: result.data, status});
    };

    const menuType = chartData.id ? MenuType.Preview : MenuType.PanePreview;

    return (
        <div className={b()} data-qa="chart-preview">
            <ChartWrapper
                usageType="chart"
                id={chartData.id}
                config={chartData.editMode}
                params={queryParams}
                onChartLoad={onLoad}
                actionParamsEnabled={actionParamsEnabled}
                forwardedRef={widgetRef}
                workbookId={workbookId}
                forceShowSafeChart={true}
                menuType={menuType}
            />
        </div>
    );
};

Preview.propTypes = {
    chartData: PropTypes.shape({
        id: PropTypes.string,
        editMode: PropTypes.shape({
            type: PropTypes.string.isRequired,
            data: PropTypes.object.isRequired,
        }).isRequired,
    }),
    onLoadData: PropTypes.func.isRequired,
    queryParams: PropTypes.object,
    widgetRef: PropTypes.object,
    actionParamsEnabled: PropTypes.bool,
    workbookId: PropTypes.string,
};

const MemoPreview = React.memo(Preview);

function PreviewWrap(props) {
    const {chartData} = props;
    const widgetRef = React.useRef(null);
    const {search} = useLocation();
    const {paneSize, ...restProps} = props;
    const queryParams = React.useMemo(() => {
        return new UrlSearch(search).delete(Object.values(URL_QUERY)).toObject();
    }, [search]);
    const {actionParamsEnabled} = Utils.getOptionsFromSearch(search);
    
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (widgetRef.current && typeof widgetRef.current.reflow === 'function') {
            widgetRef.current.reflow();
        }
    }, [paneSize]);

    React.useEffect(() => {
        dispatch(drawPreview());
        // dependance from chartData?.id for loading chart preview after opening other chart from navigation
    }, [chartData?.id]);

    if (chartData === null) {
        return null;
    }

    return (
        <MemoPreview
            key={chartData.updateKey}
            {...restProps}
            queryParams={queryParams}
            widgetRef={widgetRef}
            actionParamsEnabled={actionParamsEnabled}
        />
    );
}

PreviewWrap.propTypes = {
    paneSize: PropTypes.number,
    chartData: PropTypes.shape({
        updateKey: PropTypes.number.isRequired,
    }),
    workbookId: PropTypes.string,
};

export default PreviewWrap;
