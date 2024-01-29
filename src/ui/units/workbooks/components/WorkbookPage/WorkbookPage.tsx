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
import {Utils} from 'ui';
import {AppDispatch} from 'ui/store';

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
    selectPageError,
    selectWorkbook,
    selectWorkbookFilters,
    selectWorkbookInfoIsLoading,
} from '../../store/selectors';
import {CreateEntryDialog} from '../CreateEntryDialog/CreateEntryDialog';
import {WorkbookActions} from '../WorkbookActions/WorkbookActions';
import {WorkbookFilters} from '../WorkbookFilters/WorkbookFilters';
import {WorkbookMainTabContent} from '../WorkbookMainTabContent/WorkbookMainTabContent';
import {WorkbookTabContent} from '../WorkbookTabContent/WorkbookTabContent';
import {WorkbookTabs} from '../WorkbookTabs/WorkbookTabs';
import {TAB_ALL} from '../WorkbookTabs/constants';
import {TabId} from '../WorkbookTabs/types';

import './WorkbookPage.scss';

const b = block('dl-workbook-page');

const i18n = I18N.keyset('new-workbooks');

export const WorkbookPage = () => {
    const {search} = useLocation();
    const {workbookId} = useParams<{workbookId: string}>();

    const activeTab = React.useMemo<TabId | undefined>(() => {
        const queryTab = new URLSearchParams(search).get('tab');
        return queryTab ? (queryTab as TabId) : TAB_ALL;
    }, [search]);

    const dispatch = useDispatch<AppDispatch>();

    const collectionId = useSelector(selectCollectionId);
    const breadcrumbs = useSelector(selectBreadcrumbs);
    const workbook = useSelector(selectWorkbook);
    const pageError = useSelector(selectPageError);
    const breadcrumbsError = useSelector(selectBreadcrumbsError);
    const isWorkbookInfoLoading = useSelector(selectWorkbookInfoIsLoading);

    const filters = useSelector(selectWorkbookFilters);

    const isMainTab = activeTab === TAB_ALL;
    const scope = isMainTab ? undefined : activeTab;

    const initLoadWorkbook = React.useCallback(() => {
        dispatch(resetWorkbookState());
        dispatch(getWorkbook({workbookId}));
    }, [dispatch, workbookId]);

    const refreshWorkbookInfo = React.useCallback(() => {
        dispatch(getWorkbook({workbookId}));
    }, [dispatch, workbookId]);

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
                                                dispatch(
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
                                                                dispatch(closeDialog());
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
                            {isMainTab ? (
                                <WorkbookMainTabContent
                                    workbook={workbook}
                                    filters={filters}
                                    workbookId={workbookId}
                                />
                            ) : (
                                <WorkbookTabContent
                                    filters={filters}
                                    scope={scope}
                                    workbookId={workbookId}
                                    workbook={workbook}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
            <CreateEntryDialog />
        </div>
    );
};
