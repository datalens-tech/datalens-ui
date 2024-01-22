import {DL} from 'constants/common';

import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import {ActionBar} from '@gravity-ui/navigation';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionBreadcrumbs} from 'components/Breadcrumbs/CollectionBreadcrumbs/CollectionBreadcrumbs';
import {DIALOG_EDIT_WORKBOOK} from 'components/CollectionsStructure';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {ViewError} from 'components/ViewError/ViewError';
import {I18N} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useLocation, useParams} from 'react-router-dom';
import {EntryScope} from 'shared';
import {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';
import {Utils} from 'ui';

import {registry} from '../../../../registry';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import {
    WorkbooksDispatch,
    changeFilters,
    getWorkbook,
    getWorkbookBreadcrumbs,
    getWorkbookEntries,
    resetWorkbookEntries,
    resetWorkbookState,
} from '../../store/actions';
import {
    selectBreadcrumbs,
    selectBreadcrumbsError,
    selectCollectionId,
    selectNextPageToken,
    selectPageError,
    selectWorkbook,
    selectWorkbookFilters,
    selectWorkbookInfoIsLoading,
} from '../../store/selectors';
import {CreateEntryDialog} from '../CreateEntryDialog/CreateEntryDialog';
import {WorkbookActions} from '../WorkbookActions/WorkbookActions';
import {WorkbookContent} from '../WorkbookContent/WorkbookContent';
import {WorkbookFilters} from '../WorkbookFilters/WorkbookFilters';
import {WorkbookTabs} from '../WorkbookTabs/WorkbookTabs';
import {TAB_ALL} from '../WorkbookTabs/constants';
import {TabId} from '../WorkbookTabs/types';

import './WorkbookPage.scss';

const b = block('dl-workbook-page');

const i18n = I18N.keyset('new-workbooks');

const PAGE_SIZE_MAIN_TAB = 10;

export const WorkbookPage = () => {
    const {search} = useLocation();
    const {workbookId} = useParams<{workbookId: string}>();

    const activeTab = React.useMemo<TabId | undefined>(() => {
        const queryTab = new URLSearchParams(search).get('tab');
        return queryTab ? (queryTab as TabId) : undefined;
    }, [search]);

    const dispatch = useDispatch<WorkbooksDispatch>();
    const dialogDispatch = useDispatch();
    const collectionId = useSelector(selectCollectionId);
    const breadcrumbs = useSelector(selectBreadcrumbs);
    const workbook: WorkbookWithPermissions | null = useSelector(selectWorkbook);
    const pageError = useSelector(selectPageError);
    const breadcrumbsError = useSelector(selectBreadcrumbsError);
    const isWorkbookInfoLoading = useSelector(selectWorkbookInfoIsLoading);

    const nextPageToken = useSelector(selectNextPageToken);
    const filters = useSelector(selectWorkbookFilters);
    const [mapTokens, setMapTokens] = React.useState<Record<string, string>>({});
    const [mapErrors, setMapErrors] = React.useState<Record<string, boolean>>({});
    const [isLoadingMainTab, setIsLoadingMainTab] = React.useState(false);

    const isMainTab = activeTab === TAB_ALL;
    const scope = isMainTab ? undefined : activeTab;

    const initLoadWorkbook = React.useCallback(() => {
        dispatch(resetWorkbookState());
        dispatch(getWorkbook({workbookId}));
    }, [dispatch, workbookId]);

    const refreshWorkbookInfo = React.useCallback(() => {
        dispatch(getWorkbook({workbookId}));
    }, [dispatch, workbookId]);

    const loadMoreEntries = React.useCallback(() => {
        if (nextPageToken) {
            dispatch(
                getWorkbookEntries({
                    workbookId,
                    filters,
                    scope,
                    nextPageToken,
                }),
            );
        }
    }, [nextPageToken, dispatch, workbookId, filters, scope]);

    const loadMoreEntriesByScope = (entryScope: EntryScope) => {
        if (mapTokens[entryScope]) {
            dispatch(
                getWorkbookEntries({
                    workbookId,
                    filters,
                    scope: entryScope,
                    nextPageToken: mapTokens[entryScope],
                }),
            ).then((data) => {
                setMapTokens({
                    ...mapTokens,
                    [entryScope]: data?.nextPageToken || '',
                });
            });
        }
    };

    const retryLoadEntries = React.useCallback(() => {
        dispatch(
            getWorkbookEntries({
                workbookId,
                filters,
                scope,
                nextPageToken,
            }),
        );
    }, [dispatch, workbookId, filters, scope, nextPageToken]);

    const retryLoadEntriesByScope = React.useCallback(
        (entryScope: EntryScope) => {
            dispatch(
                getWorkbookEntries({
                    workbookId,
                    filters,
                    scope: entryScope,
                    nextPageToken,
                    pageSize: PAGE_SIZE_MAIN_TAB,
                }),
            ).then((data) => {
                setMapErrors({
                    ...mapErrors,
                    [entryScope]: false,
                });
                setMapTokens({
                    ...mapTokens,
                    [entryScope]: data?.nextPageToken || '',
                });
            });
        },
        [dispatch, workbookId, filters, nextPageToken, mapErrors, mapTokens],
    );

    const refreshEntries = React.useCallback(
        (entryScope?: EntryScope) => {
            if (!isMainTab) {
                dispatch(resetWorkbookEntries());
            }

            dispatch(getWorkbookEntries({workbookId, filters, scope: entryScope || scope}));
        },
        [isMainTab, dispatch, workbookId, filters, scope],
    );

    const handleChangeFilters = React.useCallback(
        (newFilters) => {
            dispatch(changeFilters(newFilters));
        },
        [dispatch],
    );

    React.useEffect(() => {
        initLoadWorkbook();

        return () => {
            dispatch(resetWorkbookState());
        };
    }, [initLoadWorkbook, dispatch]);

    React.useEffect(() => {
        if (collectionId) {
            dispatch(getWorkbookBreadcrumbs({collectionId}));
        }
    }, [dispatch, collectionId]);

    React.useEffect(() => {
        dispatch(resetWorkbookEntries());

        // Get entries only if active tab selected
        if (activeTab) {
            (async () => {
                if (isMainTab) {
                    if (workbook) {
                        const promises = [];

                        promises.push(
                            dispatch(
                                getWorkbookEntries({
                                    workbookId,
                                    filters,
                                    scope: EntryScope.Dash,
                                    ignoreConcurrentId: true,
                                    pageSize: PAGE_SIZE_MAIN_TAB,
                                }),
                            ),
                        );

                        if (workbook.permissions.view) {
                            promises.push(
                                dispatch(
                                    getWorkbookEntries({
                                        workbookId,
                                        filters,
                                        scope: EntryScope.Dataset,
                                        ignoreConcurrentId: true,
                                        pageSize: PAGE_SIZE_MAIN_TAB,
                                    }),
                                ),
                            );

                            promises.push(
                                dispatch(
                                    getWorkbookEntries({
                                        workbookId,
                                        filters,
                                        scope: EntryScope.Connection,
                                        ignoreConcurrentId: true,
                                        pageSize: PAGE_SIZE_MAIN_TAB,
                                    }),
                                ),
                            );
                        }

                        promises.push(
                            dispatch(
                                getWorkbookEntries({
                                    workbookId,
                                    filters,
                                    scope: EntryScope.Widget,
                                    ignoreConcurrentId: true,
                                    pageSize: PAGE_SIZE_MAIN_TAB,
                                }),
                            ),
                        );

                        setIsLoadingMainTab(true);

                        const [dataDashes, dataDatasets, dataConnections, dataWidgets] =
                            await Promise.all(promises);

                        const errors: Record<string, boolean> = {};

                        if (dataDashes === null) {
                            errors[EntryScope.Dash] = true;
                        }

                        if (dataDatasets === null) {
                            errors[EntryScope.Dataset] = true;
                        }

                        if (dataWidgets === null) {
                            errors[EntryScope.Widget] = true;
                        }

                        if (dataConnections === null) {
                            errors[EntryScope.Connection] = true;
                        }

                        setMapErrors(errors);

                        const tokensMap: Record<string, string> = {};

                        tokensMap[EntryScope.Dash] = dataDashes?.nextPageToken || '';
                        tokensMap[EntryScope.Dataset] = dataDatasets?.nextPageToken || '';
                        tokensMap[EntryScope.Widget] = dataWidgets?.nextPageToken || '';
                        tokensMap[EntryScope.Connection] = dataConnections?.nextPageToken || '';

                        setMapTokens(tokensMap);

                        setIsLoadingMainTab(false);
                    }
                } else {
                    await dispatch(getWorkbookEntries({workbookId, filters, scope}));
                }
            })();
        }
    }, [activeTab, dispatch, filters, isMainTab, scope, workbook, workbookId]);

    if (
        pageError ||
        (breadcrumbsError && Utils.parseErrorResponse(breadcrumbsError).status !== 403)
    ) {
        return (
            <div className={b()}>
                <ViewError retry={initLoadWorkbook} error={pageError} />
            </div>
        );
    }

    const {ActionPanelEntrySelect} = registry.common.components.getAll();

    return (
        <div className={b()}>
            <ActionBar aria-label="Actions bar">
                <ActionBar.Section type="primary">
                    <ActionBar.Group pull="left" className={b('action-bar-group-left')}>
                        <ActionBar.Item className={b('action-bar-left-item')}>
                            <ActionPanelEntrySelect />
                            {workbook && (
                                <CollectionBreadcrumbs
                                    className={b('breadcrumbs', {'is-mobile': DL.IS_MOBILE})}
                                    collectionBreadcrumbs={breadcrumbs ?? []}
                                    workbook={workbook}
                                    onCurrentItemClick={() => {
                                        dispatch(resetWorkbookEntries());
                                        dispatch(
                                            getWorkbookEntries({
                                                workbookId,
                                                filters,
                                                scope,
                                            }),
                                        );
                                    }}
                                />
                            )}
                        </ActionBar.Item>
                    </ActionBar.Group>
                    <ActionBar.Group pull="right">
                        <ActionBar.Item>
                            {workbook && (
                                <WorkbookActions
                                    workbook={workbook}
                                    refreshWorkbookInfo={refreshWorkbookInfo}
                                />
                            )}
                        </ActionBar.Item>
                    </ActionBar.Group>
                </ActionBar.Section>
            </ActionBar>
            {isWorkbookInfoLoading ? (
                <SmartLoader size="l" />
            ) : (
                <div className={b('layout')}>
                    <div className={b('container')}>
                        <div className={b('title-content')}>
                            <h1 className={b('title')}>{workbook?.title}</h1>
                            {workbook?.permissions.update && (
                                <Tooltip content={i18n('action_edit')}>
                                    <div>
                                        <Button
                                            onClick={() => {
                                                dialogDispatch(
                                                    openDialog({
                                                        id: DIALOG_EDIT_WORKBOOK,
                                                        props: {
                                                            open: true,
                                                            workbookId: workbook.workbookId,
                                                            title: workbook.title,
                                                            description:
                                                                workbook?.description ?? '',
                                                            onApply: refreshWorkbookInfo,
                                                            onClose: () => {
                                                                dialogDispatch(closeDialog());
                                                            },
                                                        },
                                                    }),
                                                );
                                            }}
                                        >
                                            <Icon data={PencilToLine} />
                                        </Button>
                                    </div>
                                </Tooltip>
                            )}
                        </div>
                        {workbook?.description && (
                            <div className={b('description')}>{workbook.description}</div>
                        )}
                        <div className={b('controls')}>
                            <WorkbookFilters filters={filters} onChange={handleChangeFilters} />
                            {workbook && <WorkbookTabs workbook={workbook} />}
                        </div>
                        <div className={b('content')}>
                            <WorkbookContent
                                loadMoreEntries={loadMoreEntries}
                                loadMoreEntriesByScope={loadMoreEntriesByScope}
                                retryLoadEntries={retryLoadEntries}
                                retryLoadEntriesByScope={retryLoadEntriesByScope}
                                refreshEntries={refreshEntries}
                                isLoadingMainTab={isLoadingMainTab}
                                scope={scope}
                                mapTokens={mapTokens}
                                mapErrors={mapErrors}
                            />
                        </div>
                    </div>
                </div>
            )}
            <CreateEntryDialog />
        </div>
    );
};
