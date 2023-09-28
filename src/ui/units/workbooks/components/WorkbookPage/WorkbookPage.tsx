import {DL} from 'constants/common';

import React from 'react';

import {ActionBar} from '@gravity-ui/navigation';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionBreadcrumbs} from 'components/Breadcrumbs/CollectionBreadcrumbs/CollectionBreadcrumbs';
import {DIALOG_EDIT_WORKBOOK} from 'components/CollectionsStructure';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {ViewError} from 'components/ViewError/ViewError';
import {useDispatch, useSelector} from 'react-redux';
import {useLocation, useParams} from 'react-router-dom';
import {Utils} from 'ui';

import {registry} from '../../../../registry';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import {
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

import PencilToLineIcon from '@gravity-ui/icons/svgs/pencil-to-line.svg';

import './WorkbookPage.scss';

const b = block('dl-workbook-page');

export const WorkbookPage = () => {
    const {search} = useLocation();
    const {workbookId} = useParams<{workbookId: string}>();

    const activeTab = React.useMemo<TabId | undefined>(() => {
        const queryTab = new URLSearchParams(search).get('tab');
        return queryTab ? (queryTab as TabId) : undefined;
    }, [search]);

    const dispatch = useDispatch();
    const collectionId = useSelector(selectCollectionId);
    const breadcrumbs = useSelector(selectBreadcrumbs);
    const workbook = useSelector(selectWorkbook);
    const pageError = useSelector(selectPageError);
    const breadcrumbsError = useSelector(selectBreadcrumbsError);
    const isWorkbookInfoLoading = useSelector(selectWorkbookInfoIsLoading);
    const nextPageToken = useSelector(selectNextPageToken);
    const filters = useSelector(selectWorkbookFilters);

    const scope = activeTab === TAB_ALL ? undefined : activeTab;

    const initLoadWorkbook = React.useCallback(() => {
        dispatch(resetWorkbookState());
        dispatch(getWorkbook({workbookId}));
    }, [dispatch, workbookId]);

    const refreshWorkbookInfo = React.useCallback(() => {
        dispatch(getWorkbook({workbookId}));
    }, [dispatch, workbookId]);

    const loadMoreEntries = React.useCallback(() => {
        if (nextPageToken) {
            dispatch(getWorkbookEntries({workbookId, filters, scope, nextPageToken}));
        }
    }, [nextPageToken, dispatch, filters, workbookId, scope]);

    const retryLoadEntries = React.useCallback(() => {
        dispatch(getWorkbookEntries({workbookId, filters, scope, nextPageToken}));
    }, [dispatch, workbookId, filters, scope, nextPageToken]);

    const refreshEntries = React.useCallback(() => {
        dispatch(resetWorkbookEntries());
        dispatch(getWorkbookEntries({workbookId, filters, scope}));
    }, [dispatch, workbookId, filters, scope]);

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
            dispatch(getWorkbookEntries({workbookId, filters, scope}));
        }
    }, [dispatch, workbookId, filters, activeTab, scope]);

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
                                <Button
                                    onClick={() => {
                                        dispatch(
                                            openDialog({
                                                id: DIALOG_EDIT_WORKBOOK,
                                                props: {
                                                    open: true,
                                                    workbookId: workbook.workbookId,
                                                    title: workbook.title,
                                                    description: workbook?.description ?? '',
                                                    onApply: refreshWorkbookInfo,
                                                    onClose: () => {
                                                        dispatch(closeDialog());
                                                    },
                                                },
                                            }),
                                        );
                                    }}
                                >
                                    <Icon data={PencilToLineIcon} />
                                </Button>
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
                                retryLoadEntries={retryLoadEntries}
                                refreshEntries={refreshEntries}
                                scope={scope}
                            />
                        </div>
                    </div>
                </div>
            )}
            <CreateEntryDialog />
        </div>
    );
};
