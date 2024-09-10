import React from 'react';

import block from 'bem-cn-lite';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {ViewError} from 'components/ViewError/ViewError';
import {useDispatch, useSelector} from 'react-redux';
import {useLocation, useParams} from 'react-router-dom';
import {DL} from 'ui/constants/common';
import type {AppDispatch} from 'ui/store';
import Utils from 'ui/utils/utils';

import {registry} from '../../../../registry';
import {getCollectionBreadcrumbs} from '../../../collections-navigation/store/actions';
import {selectCollectionBreadcrumbsError} from '../../../collections-navigation/store/selectors';
import {changeFilters, getWorkbook} from '../../store/actions';
import {
    selectCollectionId,
    selectPageError,
    selectWorkbook,
    selectWorkbookFilters,
} from '../../store/selectors';
import {CreateEntryDialog} from '../CreateEntryDialog/CreateEntryDialog';
import {WorkbookFilters} from '../WorkbookFilters/WorkbookFilters';
import {WorkbookMainTabContent} from '../WorkbookMainTabContent/WorkbookMainTabContent';
import {WorkbookTabContent} from '../WorkbookTabContent/WorkbookTabContent';
import {WorkbookTabs} from '../WorkbookTabs/WorkbookTabs';
import {TAB_ALL} from '../WorkbookTabs/constants';
import type {TabId} from '../WorkbookTabs/types';

import {useLayout} from './hooks/useLayout';

import './WorkbookPage.scss';

const b = block('dl-workbook-page');

export const WorkbookPage = () => {
    const {search} = useLocation();
    const {workbookId} = useParams<{workbookId: string}>();

    const dispatch = useDispatch<AppDispatch>();

    const collectionId = useSelector(selectCollectionId);
    const workbook = useSelector(selectWorkbook);
    const pageError = useSelector(selectPageError);
    const breadcrumbsError = useSelector(selectCollectionBreadcrumbsError);

    const {getWorkbookTabs} = registry.workbooks.functions.getAll();
    const availableItems = React.useMemo(() => {
        return workbook ? getWorkbookTabs(workbook).map(({id}) => id as string) : [];
    }, [getWorkbookTabs, workbook]);

    const activeTab = React.useMemo<TabId | undefined>(() => {
        const queryTab = new URLSearchParams(search).get('tab');

        return queryTab && availableItems.includes(queryTab) ? (queryTab as TabId) : TAB_ALL;
    }, [availableItems, search]);

    const filters = useSelector(selectWorkbookFilters);

    const showContentLoader = !workbook || workbook.workbookId !== workbookId;

    const isMainTab = activeTab === TAB_ALL;
    const scope = isMainTab ? undefined : activeTab;

    const initLoadWorkbook = React.useCallback(() => {
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
    }, [initLoadWorkbook, dispatch]);

    React.useEffect(() => {
        if (collectionId) {
            dispatch(getCollectionBreadcrumbs({collectionId}));
        }
    }, [dispatch, collectionId]);

    useLayout({workbookId, refreshWorkbookInfo});

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

    return (
        <div className={b()}>
            {showContentLoader ? (
                <SmartLoader size="l" />
            ) : (
                <div className={b('layout')}>
                    <div className={b('container')}>
                        <div className={b('controls')}>
                            {!DL.IS_MOBILE && (
                                <WorkbookFilters filters={filters} onChange={handleChangeFilters} />
                            )}
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
