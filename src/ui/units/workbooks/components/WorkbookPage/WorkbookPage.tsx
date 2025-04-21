import React from 'react';

import {Alert, Button, Flex, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {ViewError} from 'components/ViewError/ViewError';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect, useLocation, useParams} from 'react-router-dom';
import {Feature} from 'shared';
import {WORKBOOK_STATUS} from 'shared/constants/workbooks';
import {DL} from 'ui/constants/common';
import type {AppDispatch} from 'ui/store';
import {COLLECTIONS_PATH} from 'ui/units/collections-navigation/constants';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
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
const i18n = I18n.keyset('new-workbooks');

export const WorkbookPage = () => {
    const {search} = useLocation();
    const {workbookId} = useParams<{workbookId: string}>();

    const dispatch = useDispatch<AppDispatch>();

    const collectionId = useSelector(selectCollectionId);
    const workbook = useSelector(selectWorkbook);
    const pageError = useSelector(selectPageError);
    const breadcrumbsError = useSelector(selectCollectionBreadcrumbsError);

    const [showImportAlert, setShowImportAlert] = React.useState(
        // TODO (Export workbook): enable when logic of alert is ready
        // isEnabledFeature(Feature.EnableExportWorkbookFile) &&
        //     workbook?.meta &&
        //     'importId' in workbook.meta,
        false,
    );

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
        isEnabledFeature(Feature.EnableExportWorkbookFile) &&
        workbook?.status === WORKBOOK_STATUS.CREATING &&
        workbook?.meta.importId
    ) {
        const redirectPath = collectionId
            ? `${COLLECTIONS_PATH}/${collectionId}`
            : COLLECTIONS_PATH;
        return (
            <Redirect
                to={{
                    pathname: `${redirectPath}`,
                    state: {importId: workbook.meta.importId},
                }}
            />
        );
    }

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

    const handleCloseImportAlert = () => {
        setShowImportAlert(false);
    };

    const renderAlertActions = () => {
        return (
            <Flex gap={3}>
                <Button view="normal-contrast" onClick={handleCloseImportAlert}>
                    {i18n('button_import-alert-close')}
                </Button>
                {/* TODO (Export workbook): Add after publication of documentation */}
                {/* <Button view="flat-secondary" href={DL.ENDPOINTS.datalensDocs}>
                    {i18n('button_import-alert-documentation')}
                </Button> */}
            </Flex>
        );
    };

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
                            {showImportAlert && (
                                <Alert
                                    theme="info"
                                    title={i18n('label_import-alert-title')}
                                    actions={renderAlertActions()}
                                    onClose={handleCloseImportAlert}
                                    className={spacing({mt: 6})}
                                />
                            )}
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
