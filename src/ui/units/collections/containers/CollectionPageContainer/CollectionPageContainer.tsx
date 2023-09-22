import React from 'react';

import {DatalensGlobalState} from 'index';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {compose} from 'recompose';

import {CollectionPage} from '../../components/CollectionPage/CollectionPage';
import {
    CollectionsDispatch,
    getCollection,
    getCollectionBreadcrumbs,
    getCollectionContent,
    getRootCollectionPermissions,
    resetCollectionContent,
    resetCollectionInfo,
} from '../../store/actions';
import {
    selectBreadcrumbs,
    selectCollection,
    selectCollectionInfoIsLoading,
    selectPageError,
    selectRootPermissionsData,
    selectRootPermissionsIsLoading,
} from '../../store/selectors';
import {GetCollectionContentArgs} from '../../types';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type RouterProps = RouteComponentProps<{
    collectionId?: string;
}>;

type OuterProps = {};
type InnerProps = RouterProps & StateProps & DispatchProps;

type Props = OuterProps & InnerProps;

class CollectionPageContainer extends React.Component<Props> {
    render() {
        const {
            match,
            isRootPermissionsLoading,
            rootPermissions,
            isCollectionInfoLoading,
            collection,
            breadcrumbs,
            pageError,
            getRootCollectionPermissions: getRootCollectionPermissionsAction,
            getCollection: getCollectionAction,
            getCollectionBreadcrumbs: getCollectionBreadcrumbsAction,
            getCollectionContent: getCollectionContentAction,
            resetCollectionInfo: resetCollectionInfoAction,
            resetCollectionContent: resetCollectionContentAction,
        } = this.props;

        const {collectionId} = match.params;

        return (
            <CollectionPage
                collectionId={collectionId}
                isRootPermissionsLoading={isRootPermissionsLoading}
                rootPermissions={rootPermissions}
                isCollectionInfoLoading={isCollectionInfoLoading}
                collection={collection}
                breadcrumbs={breadcrumbs}
                pageError={pageError}
                getRootCollectionPermissions={getRootCollectionPermissionsAction}
                getCollection={getCollectionAction}
                getCollectionBreadcrumbs={getCollectionBreadcrumbsAction}
                getCollectionContent={getCollectionContentAction}
                resetCollectionInfo={resetCollectionInfoAction}
                resetCollectionContent={resetCollectionContentAction}
            />
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        isRootPermissionsLoading: selectRootPermissionsIsLoading(state),
        rootPermissions: selectRootPermissionsData(state),
        isCollectionInfoLoading: selectCollectionInfoIsLoading(state),
        collection: selectCollection(state),
        breadcrumbs: selectBreadcrumbs(state),
        pageError: selectPageError(state),
    };
};

const mapDispatchToProps = (dispatch: CollectionsDispatch) => {
    return {
        getRootCollectionPermissions: () => dispatch(getRootCollectionPermissions()),
        getCollection: (args: {collectionId: string}) => dispatch(getCollection(args)),
        getCollectionBreadcrumbs: (args: {collectionId: string}) =>
            dispatch(getCollectionBreadcrumbs(args)),
        getCollectionContent: (args: GetCollectionContentArgs) =>
            dispatch(getCollectionContent(args)),
        resetCollectionInfo: () => dispatch(resetCollectionInfo()),
        resetCollectionContent: () => dispatch(resetCollectionContent()),
    };
};

const Container = compose<Props, OuterProps>(
    connect(mapStateToProps, mapDispatchToProps),
    withRouter,
)(CollectionPageContainer);

export {Container as CollectionPageContainer};
