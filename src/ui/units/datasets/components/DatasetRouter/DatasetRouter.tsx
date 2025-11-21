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
import {Feature} from 'shared';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {resetDatasetState} from 'units/datasets/store/actions/creators';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import withInaccessibleOnMobile from '../../../../hoc/withInaccessibleOnMobile';
import DatasetPage from '../../containers/DatasetPage/DatasetPage';
import {datasetKeySelector} from '../../store/selectors/dataset';

import {UnloadConfirmation} from './UnloadConfirmation';

import './DatasetRouter.scss';

const b = block('dataset-router');

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = StateProps &
    DispatchProps &
    RouteComponentProps & {
        sdk: SDK;
    };

const getDatasetPaths = (end: string) => {
    const routes = [end, `/workbooks/:workbookId${end}`];
    if (isEnabledFeature(Feature.EnableSharedEntries)) {
        routes.push(`/collections/:collectionId${end}`);
    }
    return routes;
};

const DatasetRouter = ({sdk, datasetKey, setCurrentPageEntry, resetDatasetState, match}: Props) => {
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();
    const {extractEntryId} = registry.common.functions.getAll();
    const possibleEntryId = extractEntryId(window.location.pathname);

    React.useEffect(() => {
        return () => {
            resetDatasetState();
        };
    }, [resetDatasetState]);

    const prevMatch = usePrevious(match) || match;

    React.useEffect(() => {
        const prevEntryId = extractEntryId(prevMatch.url);
        const currentEntryId = extractEntryId(match.url);

        if (prevEntryId !== currentEntryId) {
            resetDatasetState();
        }
    }, [prevMatch.url, match.url, extractEntryId, resetDatasetState]);

    React.useEffect(() => {
        if (!isAsideHeaderEnabled || !possibleEntryId || !datasetKey) {
            return;
        }

        setCurrentPageEntry({
            entryId: possibleEntryId,
            key: datasetKey,
        });
    }, [isAsideHeaderEnabled, possibleEntryId, datasetKey, setCurrentPageEntry]);

    return (
        <div className={b()}>
            <Switch>
                <Route
                    path={getDatasetPaths('/datasets/new')}
                    render={(
                        props: RouteComponentProps<{workbookId?: string; collectionId?: string}>,
                    ) => {
                        const {workbookId, collectionId} = props.match.params;
                        return (
                            <DatasetPage
                                {...props}
                                sdk={sdk}
                                datasetId={workbookId}
                                workbookId={workbookId}
                                collectionId={collectionId}
                            />
                        );
                    }}
                />
                <Route
                    path={getDatasetPaths('/datasets/:datasetId')}
                    render={(
                        props: RouteComponentProps<{
                            datasetId?: string;
                            workbookId?: string;
                            collectionId?: string;
                        }>,
                    ) => {
                        const {datasetId, workbookId, collectionId} = props.match.params;
                        return (
                            <DatasetPage
                                {...props}
                                sdk={sdk}
                                datasetId={datasetId}
                                workbookId={workbookId}
                                collectionId={collectionId}
                            />
                        );
                    }}
                />
            </Switch>
            <UnloadConfirmation />
        </div>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        datasetKey: datasetKeySelector(state),
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
