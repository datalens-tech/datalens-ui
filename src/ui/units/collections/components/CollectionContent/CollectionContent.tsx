import React from 'react';

import type {CancellablePromise} from '@gravity-ui/sdk';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Waypoint} from 'react-waypoint';
import type {BatchAction} from 'ui/components/Navigation/types';
import {isMobileView} from 'ui/utils/mobile';

import type {
    CollectionWithPermissions,
    GetCollectionContentArgs,
    GetCollectionContentResponse,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {AnimateBlock} from '../../../../components/AnimateBlock';
import type {CollectionContentFilters} from '../../../../components/CollectionFilters';
import {CollectionPageViewMode} from '../../../../components/CollectionFilters';
import {BatchPanel} from '../../../../components/Navigation/components/BatchPanel/BatchPanel';
import {PlaceholderIllustration} from '../../../../components/PlaceholderIllustration/PlaceholderIllustration';
import {SmartLoader} from '../../../../components/SmartLoader/SmartLoader';
import {
    selectCollectionContentError,
    selectCollectionContentIsLoading,
    selectCollectionContentNextPageTokens,
} from '../../store/selectors';
import {CollectionContentGrid} from '../CollectionContentGrid';
import {CollectionContentTable} from '../CollectionContentTable';
import type {SelectedMap, UpdateCheckboxArgs} from '../CollectionPage/hooks';
import {DEFAULT_FILTERS, PAGE_SIZE} from '../constants';

import {useActions} from './hooks';

import './CollectionContent.scss';

const b = block('dl-collection-content');
const i18n = I18n.keyset('collections');

interface Props {
    curCollectionId: string | null;
    filters: CollectionContentFilters;
    viewMode: CollectionPageViewMode;
    selectedMap: SelectedMap;
    selectedMapWithMovePermission: SelectedMap;
    selectedMapWithDeletePermission: SelectedMap;
    itemsAvailableForSelection: (CollectionWithPermissions | WorkbookWithPermissions)[];
    isOpenSelectionMode: boolean;
    canCreateWorkbook: boolean;
    getCollectionContentRecursively: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    fetchCollectionContent: () => void;
    onCloseMoveDialog: (structureChanged: boolean) => void;
    onCreateWorkbookClick: () => void;
    onClearFiltersClick: () => void;
    onMoveSelectedEntitiesClick: () => void;
    onDeleteSelectedEntitiesClick: () => void;
    onUpdateCheckboxClick: (args: UpdateCheckboxArgs) => void;
    onUpdateAllCheckboxesClick: (checked: boolean) => void;
    resetSelected: () => void;
    items: (CollectionWithPermissions | WorkbookWithPermissions)[];
}

export const CollectionContent: React.FC<Props> = ({
    curCollectionId,
    filters,
    viewMode,
    selectedMap,
    selectedMapWithMovePermission,
    selectedMapWithDeletePermission,
    itemsAvailableForSelection,
    isOpenSelectionMode,
    canCreateWorkbook,
    getCollectionContentRecursively,
    fetchCollectionContent,
    onCloseMoveDialog,
    onCreateWorkbookClick,
    onClearFiltersClick,
    onMoveSelectedEntitiesClick,
    onDeleteSelectedEntitiesClick,
    onUpdateCheckboxClick,
    onUpdateAllCheckboxesClick,
    resetSelected,
    items,
}) => {
    const isCollectionContentLoading = useSelector(selectCollectionContentIsLoading);
    const collectionContentError = useSelector(selectCollectionContentError);
    const collectionContentNextPageTokens = useSelector(selectCollectionContentNextPageTokens);

    const isDefaultFilters =
        filters.filterString === DEFAULT_FILTERS.filterString &&
        filters.onlyMy === DEFAULT_FILTERS.onlyMy &&
        filters.mode === DEFAULT_FILTERS.mode;

    const [waypointDisabled, setWaypointDisabled] = React.useState(false);

    React.useEffect(() => {
        if (collectionContentError) {
            setWaypointDisabled(true);
        }
    }, [collectionContentError]);

    const onAction = React.useCallback(
        (action: BatchAction) => {
            if (action === 'move') {
                onMoveSelectedEntitiesClick();
            } else if (action === 'delete') {
                onDeleteSelectedEntitiesClick();
            }
        },
        [onDeleteSelectedEntitiesClick, onMoveSelectedEntitiesClick],
    );

    const onWaypointEnter = React.useCallback(() => {
        if (
            collectionContentNextPageTokens.collectionsNextPageToken ||
            collectionContentNextPageTokens.workbooksNextPageToken
        ) {
            getCollectionContentRecursively({
                collectionId: curCollectionId,
                collectionsPage: collectionContentNextPageTokens.collectionsNextPageToken,
                workbooksPage: collectionContentNextPageTokens.workbooksNextPageToken,
                pageSize: PAGE_SIZE,
                filterString: filters.filterString,
                orderField: filters.orderField,
                orderDirection: filters.orderDirection,
                mode: filters.mode,
                onlyMy: filters.onlyMy,
            }).then((res) => {
                if (
                    (res?.collectionsNextPageToken &&
                        res?.collectionsNextPageToken ===
                            collectionContentNextPageTokens.collectionsNextPageToken) ||
                    (res?.workbooksNextPageToken &&
                        res?.workbooksNextPageToken ===
                            collectionContentNextPageTokens.workbooksNextPageToken)
                ) {
                    setWaypointDisabled(true);
                }
                return res;
            });
        }
    }, [
        curCollectionId,
        filters.filterString,
        filters.mode,
        filters.onlyMy,
        filters.orderDirection,
        filters.orderField,
        getCollectionContentRecursively,
        collectionContentNextPageTokens.collectionsNextPageToken,
        collectionContentNextPageTokens.workbooksNextPageToken,
    ]);

    const {getCollectionActions, getWorkbookActions} = useActions({
        fetchCollectionContent,
        onCloseMoveDialog,
    });

    if (isCollectionContentLoading && items.length === 0) {
        return <SmartLoader size="l" />;
    }

    if (items.length === 0) {
        if (isDefaultFilters || isMobileView) {
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
                                        className={b('placeholder-controls')}
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
        const description = isMobileView ? undefined : i18n('section_incorrect-filters');

        return (
            <AnimateBlock className={b('empty-state')}>
                <PlaceholderIllustration
                    name="notFound"
                    title={i18n('label_not-found')}
                    description={description}
                    renderAction={() => {
                        if (isMobileView) {
                            return null;
                        }

                        return (
                            <Button
                                className={b('placeholder-controls')}
                                onClick={onClearFiltersClick}
                            >
                                {i18n('action_clear-filters')}
                            </Button>
                        );
                    }}
                />
            </AnimateBlock>
        );
    }

    const showGridMode = viewMode === CollectionPageViewMode.Grid && !isMobileView;

    return (
        <div className={b()}>
            {showGridMode ? (
                <CollectionContentGrid
                    selectedMap={selectedMap}
                    isOpenSelectionMode={isOpenSelectionMode}
                    getWorkbookActions={getWorkbookActions}
                    getCollectionActions={getCollectionActions}
                    onUpdateCheckboxClick={onUpdateCheckboxClick}
                />
            ) : (
                <CollectionContentTable
                    selectedMap={selectedMap}
                    itemsAvailableForSelectionCount={itemsAvailableForSelection.length}
                    getWorkbookActions={getWorkbookActions}
                    getCollectionActions={getCollectionActions}
                    onUpdateCheckboxClick={onUpdateCheckboxClick}
                    onUpdateAllCheckboxesClick={onUpdateAllCheckboxesClick}
                />
            )}

            {Object.keys(selectedMap).length > 0 && (
                <div className={b('batch-panel-placeholder')}>
                    <BatchPanel
                        count={Object.keys(selectedMap).length}
                        countForMove={Object.keys(selectedMapWithMovePermission).length}
                        countForDelete={Object.keys(selectedMapWithDeletePermission).length}
                        onAction={onAction}
                        className={b('batch-panel')}
                        onClose={resetSelected}
                    />
                </div>
            )}

            {isCollectionContentLoading && (
                <SmartLoader className={b('loader')} size="m" showAfter={0} />
            )}
            {!isCollectionContentLoading && !waypointDisabled && (
                <Waypoint onEnter={onWaypointEnter} />
            )}
        </div>
    );
};
