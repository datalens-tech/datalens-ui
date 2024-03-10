import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Waypoint} from 'react-waypoint';

import type {GetCollectionContentResponse} from '../../../../../shared/schema';
import {GetCollectionContentArgs} from '../../../../../shared/schema';
import {CollectionPageViewMode} from '../../../../components/CollectionFilters/CollectionFilters';
import {BatchPanel} from '../../../../components/Navigation/components/BatchPanel/BatchPanel';
import {PlaceholderIllustration} from '../../../../components/PlaceholderIllustration/PlaceholderIllustration';
import {SmartLoader} from '../../../../components/SmartLoader/SmartLoader';
import {AnimateBlock} from '../../../collections-navigation/components/AnimateBlock';
import {
    selectContentError,
    selectContentIsLoading,
    selectNextPageTokens,
} from '../../store/selectors';
import {CollectionContentGrid} from '../CollectionContentGrid/CollectionContentGrid';
import {CollectionContentTable} from '../CollectionContentTable/CollectionContentTable';
import {ContentProps} from '../types';

import {useActions} from './hooks';

import './CollectionContent.scss';

const b = block('dl-collection-content');
const i18n = I18n.keyset('collections');

interface Props extends ContentProps {
    collectionId: string | null;
    pageSize: number;
    collectionPageViewMode: CollectionPageViewMode;
    isDefaultFilters: boolean;
    isOpenSelectionMode: boolean;
    canCreateWorkbook: boolean;
    refreshPage: () => void;
    refreshContent: () => void;
    getCollectionContentRecursively: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    onCreateWorkbookClick: () => void;
    onClearFiltersClick: () => void;
    setBatchAction: () => void;
    resetSelected: () => void;
}

export const CollectionContent: React.FC<Props> = ({
    collectionId,
    pageSize,
    filters,
    collectionPageViewMode,
    isDefaultFilters,
    canCreateWorkbook,
    isOpenSelectionMode,
    canMove,
    contentItems,
    countItemsWithPermissionMove,
    selectedMap,
    countSelected,
    getCollectionContentRecursively,
    onCreateWorkbookClick,
    onClearFiltersClick,
    refreshContent,
    setBatchAction,
    resetSelected,
    onSelectAll,
    onUpdateCheckbox,
}) => {
    const isContentLoading = useSelector(selectContentIsLoading);
    const contentLoadingError = useSelector(selectContentError);
    const nextPageTokens = useSelector(selectNextPageTokens);

    const [waypointDisabled, setWaypointDisabled] = React.useState(false);

    React.useEffect(() => {
        if (contentLoadingError) {
            setWaypointDisabled(true);
        }
    }, [contentLoadingError]);

    const onWaypointEnter = React.useCallback(() => {
        if (nextPageTokens.collectionsNextPageToken || nextPageTokens.workbooksNextPageToken) {
            getCollectionContentRecursively({
                collectionId,
                collectionsPage: nextPageTokens.collectionsNextPageToken,
                workbooksPage: nextPageTokens.workbooksNextPageToken,
                pageSize,
                filterString: filters.filterString,
                orderField: filters.orderField,
                orderDirection: filters.orderDirection,
                mode: filters.mode,
                onlyMy: filters.onlyMy,
            }).then((res) => {
                if (
                    (res?.collectionsNextPageToken &&
                        res?.collectionsNextPageToken ===
                            nextPageTokens.collectionsNextPageToken) ||
                    (res?.workbooksNextPageToken &&
                        res?.workbooksNextPageToken === nextPageTokens.workbooksNextPageToken)
                ) {
                    setWaypointDisabled(true);
                }
                return res;
            });
        }
    }, [
        collectionId,
        filters.filterString,
        filters.mode,
        filters.onlyMy,
        filters.orderDirection,
        filters.orderField,
        getCollectionContentRecursively,
        nextPageTokens.collectionsNextPageToken,
        nextPageTokens.workbooksNextPageToken,
        pageSize,
    ]);

    const {getCollectionActions, getWorkbookActions} = useActions({refreshContent});

    if (isContentLoading && contentItems.length === 0) {
        return <SmartLoader size="l" />;
    }

    if (contentItems.length === 0) {
        if (isDefaultFilters) {
            return (
                <AnimateBlock className={b('empty-state')}>
                    <PlaceholderIllustration
                        name="template"
                        title={i18n('label_empty-list')}
                        description={canCreateWorkbook ? i18n('section_create-first') : undefined}
                        renderAction={() => {
                            if (canCreateWorkbook) {
                                return (
                                    <Button
                                        className={b('controls')}
                                        onClick={onCreateWorkbookClick}
                                    >
                                        {i18n('action_create-workbook')}
                                    </Button>
                                );
                            }
                            return null;
                        }}
                    />
                </AnimateBlock>
            );
        }
        return (
            <AnimateBlock className={b('empty-state')}>
                <PlaceholderIllustration
                    name="notFound"
                    title={i18n('label_not-found')}
                    description={i18n('section_incorrect-filters')}
                    renderAction={() => {
                        return (
                            <Button className={b('controls')} onClick={onClearFiltersClick}>
                                {i18n('action_clear-filters')}
                            </Button>
                        );
                    }}
                />
            </AnimateBlock>
        );
    }

    return (
        <div className={b()}>
            {collectionPageViewMode === CollectionPageViewMode.Grid ? (
                <CollectionContentGrid
                    contentItems={contentItems}
                    countItemsWithPermissionMove={countItemsWithPermissionMove}
                    getWorkbookActions={getWorkbookActions}
                    getCollectionActions={getCollectionActions}
                    onUpdateCheckbox={onUpdateCheckbox}
                    onSelectAll={onSelectAll}
                    selectedMap={selectedMap}
                    isOpenSelectionMode={isOpenSelectionMode}
                />
            ) : (
                <CollectionContentTable
                    contentItems={contentItems}
                    countItemsWithPermissionMove={countItemsWithPermissionMove}
                    getWorkbookActions={getWorkbookActions}
                    getCollectionActions={getCollectionActions}
                    onUpdateCheckbox={onUpdateCheckbox}
                    onSelectAll={onSelectAll}
                    selectedMap={selectedMap}
                    countSelected={countSelected}
                    canMove={canMove}
                />
            )}

            {Boolean(countSelected) && (
                <div className={b('batch-panel-placeholder')}>
                    <BatchPanel
                        count={countSelected}
                        onAction={setBatchAction}
                        className={b('batch-panel')}
                        onClose={resetSelected}
                    />
                </div>
            )}

            {isContentLoading && <SmartLoader className={b('loader')} size="m" showAfter={0} />}
            {!isContentLoading && !waypointDisabled && <Waypoint onEnter={onWaypointEnter} />}
        </div>
    );
};
