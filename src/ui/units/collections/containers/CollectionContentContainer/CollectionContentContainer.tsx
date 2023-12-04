import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {DatalensGlobalState} from 'index';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import type {GetCollectionContentResponse} from '../../../../../shared/schema';
import type {
    CollectionContentFilters,
    CollectionPageViewMode,
} from '../../../../components/CollectionFilters/CollectionFilters';
import {CollectionContent} from '../../components/CollectionContent/CollectionContent';
import {
    selectCollectionContentItems,
    selectContentError,
    selectContentIsLoading,
    selectNextPageTokens,
} from '../../store/selectors';
import {GetCollectionContentArgs} from '../../types';

type StateProps = ReturnType<typeof mapStateToProps>;

type OuterProps = {
    collectionId: string | null;
    filters: CollectionContentFilters;
    collectionPageViewMode: CollectionPageViewMode;
    setFilters: (filters: CollectionContentFilters) => void;
    isDefaultFilters: boolean;
    pageSize: number;
    canCreateWorkbook: boolean;
    refreshPage: () => void;
    refreshContent: () => void;
    getCollectionContentRecursively: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    onCreateWorkbookClick: () => void;
    onClearFiltersClick: () => void;
};
type InnerProps = StateProps;

type Props = OuterProps & InnerProps;

class CollectionContentContainer extends React.Component<Props> {
    render() {
        const {
            collectionId,
            pageSize,
            filters,
            collectionPageViewMode,
            setFilters,
            isDefaultFilters,
            isContentLoading,
            contentLoadingError,
            contentItems,
            nextPageTokens,
            canCreateWorkbook,
            refreshPage,
            refreshContent,
            getCollectionContentRecursively,
            onCreateWorkbookClick,
            onClearFiltersClick,
        } = this.props;

        return (
            <CollectionContent
                collectionId={collectionId}
                pageSize={pageSize}
                filters={filters}
                collectionPageViewMode={collectionPageViewMode}
                setFilters={setFilters}
                isDefaultFilters={isDefaultFilters}
                isContentLoading={isContentLoading}
                contentLoadingError={contentLoadingError}
                contentItems={contentItems}
                nextPageTokens={nextPageTokens}
                refreshPage={refreshPage}
                refreshContent={refreshContent}
                getCollectionContentRecursively={getCollectionContentRecursively}
                onCreateWorkbookClick={onCreateWorkbookClick}
                canCreateWorkbook={canCreateWorkbook}
                onClearFiltersClick={onClearFiltersClick}
            />
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        isContentLoading: selectContentIsLoading(state),
        contentLoadingError: selectContentError(state),
        contentItems: selectCollectionContentItems(state),
        nextPageTokens: selectNextPageTokens(state),
    };
};

const Container = compose<Props, OuterProps>(connect(mapStateToProps))(CollectionContentContainer);

export {Container as CollectionContentContainer};
