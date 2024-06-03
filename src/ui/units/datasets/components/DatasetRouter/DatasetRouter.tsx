import React from 'react';

import block from 'bem-cn-lite';
import {usePrevious} from 'hooks/usePrevious';
import type {DatalensGlobalState} from 'index';
import type {SDK} from 'libs';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {Route, Switch, withRouter} from 'react-router-dom';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import {selectAsideHeaderData} from 'store/selectors/asideHeader';
import {registry} from 'ui/registry';
import {resetDatasetState} from 'units/datasets/store/actions/creators';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import withInaccessibleOnMobile from '../../../../hoc/withInaccessibleOnMobile';
import DatasetPage from '../../containers/DatasetPage/DatasetPage';
import {datasetKeySelector} from '../../store/selectors/dataset';

import './DatasetRouter.scss';

const b = block('dataset-router');

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = StateProps &
    DispatchProps &
    RouteComponentProps & {
        sdk: SDK;
    };

const DatasetRouter = ({
    sdk,
    datasetKey,
    setCurrentPageEntry,
    asideHeaderData,
    resetDatasetState,
    match,
}: Props) => {
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();
    const {extractEntryId} = registry.common.functions.getAll();
    const possibleEntryId = extractEntryId(window.location.pathname);

    React.useEffect(() => {
        return () => {
            resetDatasetState();
        };
    }, []);

    const prevMatch = usePrevious(match) || match;

    React.useEffect(() => {
        const prevEntryId = extractEntryId(prevMatch.url);
        const currentEntryId = extractEntryId(match.url);

        if (prevEntryId !== currentEntryId) {
            resetDatasetState();
        }
    }, [prevMatch.url, match.url]);

    React.useEffect(() => {
        if (!isAsideHeaderEnabled || !possibleEntryId || !datasetKey) {
            return;
        }

        setCurrentPageEntry({
            entryId: possibleEntryId,
            key: datasetKey,
        });
    }, [isAsideHeaderEnabled, possibleEntryId, datasetKey]);

    return (
        <div className={b()}>
            <Switch>
                <Route
                    path={['/datasets/new', '/workbooks/:workbookId/datasets/new']}
                    render={(props) => (
                        <DatasetPage
                            {...props}
                            sdk={sdk}
                            asideHeaderData={asideHeaderData}
                            isCreationProcess={true}
                        />
                    )}
                />
                <Route
                    path={['/datasets/:datasetId', '/workbooks/:workbookId/datasets/:datasetId']}
                    render={(props) => (
                        <DatasetPage {...props} asideHeaderData={asideHeaderData} sdk={sdk} />
                    )}
                />
            </Switch>
        </div>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        datasetKey: datasetKeySelector(state),
        asideHeaderData: selectAsideHeaderData(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            setCurrentPageEntry,
            resetDatasetState,
        },
        dispatch,
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withInaccessibleOnMobile(withRouter(DatasetRouter)));
