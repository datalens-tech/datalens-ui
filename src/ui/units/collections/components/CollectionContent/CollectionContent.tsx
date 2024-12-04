import React from 'react';

import type {CancellablePromise} from '@gravity-ui/sdk';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {Waypoint} from 'react-waypoint';
import {DL} from 'ui/constants/common';

import type {
    CollectionWithPermissions,
    GetStructureItemsArgs,
    GetStructureItemsResponse,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {AnimateBlock} from '../../../../components/AnimateBlock';
import type {StructureItemsFilters} from '../../../../components/CollectionFilters';
import {CollectionPageViewMode} from '../../../../components/CollectionFilters';
import {PlaceholderIllustration} from '../../../../components/PlaceholderIllustration/PlaceholderIllustration';
import {SmartLoader} from '../../../../components/SmartLoader/SmartLoader';
import {registry} from '../../../../registry';
import type {AppDispatch} from '../../../../store';
import {
    selectStructureItemsError,
    selectStructureItemsIsLoading,
    selectStructureItemsNextPageToken,
} from '../../store/selectors';
import type {CollectionBatchAction} from '../CollectionBatchPanel/CollectionBatchPanel';
import {CollectionBatchPanel} from '../CollectionBatchPanel/CollectionBatchPanel';
import {CollectionContentGrid} from '../CollectionContentGrid';
import {CollectionContentTable} from '../CollectionContentTable';
import type {SelectedMap, UpdateCheckboxArgs} from '../CollectionPage/hooks';
import {DEFAULT_FILTERS, EmptyPlaceholderActionId, PAGE_SIZE} from '../constants';
import type {EmptyPlaceholderAction} from '../types';

import {useActions} from './hooks';

import './CollectionContent.scss';

const b = block('dl-collection-content');
const i18n = I18n.keyset('collections');

interface Props {
    curCollectionId: string | null;
    filters: StructureItemsFilters;
    viewMode: CollectionPageViewMode;
    selectedMap: SelectedMap;
    selectedMapWithMovePermission: SelectedMap;
    selectedMapWithDeletePermission: SelectedMap;
    itemsAvailableForSelection: (CollectionWithPermissions | WorkbookWithPermissions)[];
    isOpenSelectionMode: boolean;
    canCreateWorkbook: boolean;
    isEmptyItems: boolean;
    getStructureItemsRecursively: (
        args: GetStructureItemsArgs,
    ) => CancellablePromise<GetStructureItemsResponse | null>;
    fetchStructureItems: () => void;
    onCloseMoveDialog: (structureChanged: boolean) => void;
    onCreateWorkbookWithConnectionClick: () => void;
    onClearFiltersClick: () => void;
    onMoveSelectedEntitiesClick: () => void;
    onDeleteSelectedEntitiesClick: () => void;
    onUpdateCheckboxClick: (args: UpdateCheckboxArgs) => void;
    onUpdateAllCheckboxesClick: (checked: boolean) => void;
    resetSelected: () => void;
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
    isEmptyItems,
    getStructureItemsRecursively,
    fetchStructureItems,
    onCloseMoveDialog,
    onCreateWorkbookWithConnectionClick,
    onClearFiltersClick,
    onMoveSelectedEntitiesClick,
    onDeleteSelectedEntitiesClick,
    onUpdateCheckboxClick,
    onUpdateAllCheckboxesClick,
    resetSelected,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const history = useHistory();

    const isStructureItemsLoading = useSelector(selectStructureItemsIsLoading);
    const structureItemsError = useSelector(selectStructureItemsError);
    const nextPageToken = useSelector(selectStructureItemsNextPageToken);

    const isDefaultFilters =
        filters.filterString === DEFAULT_FILTERS.filterString &&
        filters.onlyMy === DEFAULT_FILTERS.onlyMy &&
        filters.mode === DEFAULT_FILTERS.mode;

    const [waypointDisabled, setWaypointDisabled] = React.useState(false);

    React.useEffect(() => {
        if (structureItemsError) {
            setWaypointDisabled(true);
        }
    }, [structureItemsError]);

    const onAction = React.useCallback(
        (action: CollectionBatchAction) => {
            if (action === 'move') {
                onMoveSelectedEntitiesClick();
            } else if (action === 'delete') {
                onDeleteSelectedEntitiesClick();
            }
        },
        [onDeleteSelectedEntitiesClick, onMoveSelectedEntitiesClick],
    );

    const onWaypointEnter = React.useCallback(() => {
        if (nextPageToken) {
            getStructureItemsRecursively({
                collectionId: curCollectionId,
                page: nextPageToken,
                pageSize: PAGE_SIZE,
                filterString: filters.filterString,
                orderField: filters.orderField,
                orderDirection: filters.orderDirection,
                mode: filters.mode,
                onlyMy: filters.onlyMy,
            }).then((res) => {
                if (res?.nextPageToken && res?.nextPageToken === nextPageToken) {
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
        getStructureItemsRecursively,
        nextPageToken,
    ]);

    const {getCollectionActions, getWorkbookActions} = useActions({
        fetchStructureItems,
        onCloseMoveDialog,
    });

    if (isStructureItemsLoading && isEmptyItems) {
        return <SmartLoader size="l" />;
    }

    if (isEmptyItems) {
        if (isDefaultFilters || DL.IS_MOBILE) {
            const actions: EmptyPlaceholderAction[] = [];

            if (canCreateWorkbook) {
                actions.push({
                    id: EmptyPlaceholderActionId.ConnectYourData,
                    title: i18n('action_connect-your-data'),
                    view: 'action',
                    handler: onCreateWorkbookWithConnectionClick,
                });
            }

            const {customizeEmptyPlaceholder} = registry.collections.functions.getAll();

            const {
                title: emptyPlaceholderTitle,
                description: emptyPlaceholderDescription,
                actions: emptyPlaceholderActions,
            } = customizeEmptyPlaceholder({
                dispatch,
                history,
                curCollectionId,
                canCreateWorkbook,
                title: i18n('label_empty-list'),
                description: canCreateWorkbook ? i18n('section_create-first') : undefined,
                actions,
            });

            return (
                <AnimateBlock className={b('empty-state')}>
                    <PlaceholderIllustration
                        name="template"
                        title={emptyPlaceholderTitle}
                        description={emptyPlaceholderDescription}
                        renderAction={() => {
                            if (emptyPlaceholderActions.length > 0) {
                                return (
                                    <div className={b('placeholder-controls')}>
                                        {emptyPlaceholderActions.map((action) => (
                                            <Button
                                                key={action.id}
                                                view={action.view}
                                                onClick={action.handler}
                                            >
                                                {action.title}
                                            </Button>
                                        ))}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </AnimateBlock>
            );
        }
        const description = DL.IS_MOBILE ? undefined : i18n('section_incorrect-filters');

        return (
            <AnimateBlock className={b('empty-state')}>
                <PlaceholderIllustration
                    name="notFound"
                    title={i18n('label_not-found')}
                    description={description}
                    renderAction={() => {
                        if (DL.IS_MOBILE) {
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

    const showGridMode = viewMode === CollectionPageViewMode.Grid && !DL.IS_MOBILE;

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
                    <CollectionBatchPanel
                        countForMove={Object.keys(selectedMapWithMovePermission).length}
                        countForDelete={Object.keys(selectedMapWithDeletePermission).length}
                        onAction={onAction}
                        className={b('batch-panel')}
                        onClose={resetSelected}
                    />
                </div>
            )}

            {isStructureItemsLoading && (
                <SmartLoader className={b('loader')} size="m" showAfter={0} />
            )}
            {!isStructureItemsLoading && !waypointDisabled && (
                <Waypoint onEnter={onWaypointEnter} />
            )}
        </div>
    );
};
