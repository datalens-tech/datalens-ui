import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {DatalensGlobalState} from 'index';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import type {GetCollectionContentResponse} from '../../../../../shared/schema';
import type {CollectionPageViewMode} from '../../../../components/CollectionFilters/CollectionFilters';
import {CollectionContent} from '../../components/CollectionContent/CollectionContent';
import {ContentProps} from '../../components/types';
import {
    selectContentError,
    selectContentIsLoading,
    selectNextPageTokens,
} from '../../store/selectors';
import {GetCollectionContentArgs} from '../../types';

type StateProps = ReturnType<typeof mapStateToProps>;

interface OuterProps extends ContentProps {
    collectionId: string | null;
    collectionPageViewMode: CollectionPageViewMode;
    isDefaultFilters: boolean;
    pageSize: number;
    canCreateWorkbook: boolean;
    refreshContent: () => void;
    getCollectionContentRecursively: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    onCreateWorkbookClick: () => void;
    onClearFiltersClick: () => void;
    setBatchAction: () => void;
    resetSelected: () => void;
}
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
            isOpenSelectionMode,
            contentLoadingError,
            contentItems,
            selectedMap,
            countSelected,
            nextPageTokens,
            canCreateWorkbook,
            refreshContent,
            getCollectionContentRecursively,
            onCreateWorkbookClick,
            onClearFiltersClick,
            setBatchAction,
            resetSelected,
            onSelectAll,
            onUpdateCheckbox,
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
                isOpenSelectionMode={isOpenSelectionMode}
                contentLoadingError={contentLoadingError}
                contentItems={contentItems}
                selectedMap={selectedMap}
                countSelected={countSelected}
                nextPageTokens={nextPageTokens}
                refreshContent={refreshContent}
                getCollectionContentRecursively={getCollectionContentRecursively}
                onCreateWorkbookClick={onCreateWorkbookClick}
                canCreateWorkbook={canCreateWorkbook}
                onClearFiltersClick={onClearFiltersClick}
                setBatchAction={setBatchAction}
                onSelectAll={onSelectAll}
                resetSelected={resetSelected}
                onUpdateCheckbox={onUpdateCheckbox}
            />
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        isContentLoading: selectContentIsLoading(state),
        contentLoadingError: selectContentError(state),
        nextPageTokens: selectNextPageTokens(state),
    };
};

const Container = compose<Props, OuterProps>(connect(mapStateToProps))(CollectionContentContainer);

export {Container as CollectionContentContainer};
