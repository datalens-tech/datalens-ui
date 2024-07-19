import React from 'react';

import type {ConfigLayout} from '@gravity-ui/dashkit';
import {Link} from '@gravity-ui/uikit';
import {AccessRightsUrlOpen} from 'components/AccessRights/AccessRightsUrlOpen';
import {I18n} from 'i18n';
import update from 'immutability-helper';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import type {DashSettings} from 'shared';
import {Feature} from 'shared';
import type {EntryDialogues} from 'ui/components/EntryDialogues';
import {EntryDialogName} from 'ui/components/EntryDialogues';
import {PageTitle} from 'ui/components/PageTitle';
import {SlugifyUrl} from 'ui/components/SlugifyUrl';
import {DL, URL_QUERY} from 'ui/constants';
import type {DatalensGlobalState} from 'ui/index';
import {Interpolate} from 'ui/index';
import {axiosInstance} from 'ui/libs';
import {NULL_HEADER} from 'ui/libs/axios/axios';
import {registry} from 'ui/registry';
import {closeDialog, openWarningDialog} from 'ui/store/actions/dialog';
import {showToast} from 'ui/store/actions/toaster';
import {addWorkbookInfo, resetWorkbookPermissions} from 'ui/units/workbooks/store/actions';
import Utils, {formDocsEndpointDL} from 'ui/utils';

const i18n = I18n.keyset('dash.main.view');

import {ITEM_TYPE} from '../../../../constants/dialogs';
import {
    cleanRevisions,
    setRevisionsListMode,
    setRevisionsMode,
} from '../../../../store/actions/entryContent';
import {selectEntryContentRevId, selectLockToken} from '../../../../store/selectors/entryContent';
import {RevisionsListMode, RevisionsMode} from '../../../../store/typings/entryContent';
import {LOCK_DURATION, LOCK_EXTEND_TIMEOUT} from '../../modules/constants';
import type {CopiedConfigData} from '../../modules/helpers';
import {getDashkitSettings, getTabTitleById, isItemPasteAllowed} from '../../modules/helpers';
import {load as loadDash, setEditMode} from '../../store/actions/base/actions';
import {
    cleanLock,
    deleteLock,
    setCopiedItemData,
    setErrorMode,
    setLock,
    setPageTab,
    updateDashOpenedDesc,
} from '../../store/actions/dashTyped';
import {
    canEdit,
    isDraft,
    isEditMode,
    selectDashEntry,
    selectDashGlobalDefaultParams,
    selectSettings,
    selectTabId,
    selectTabs,
} from '../../store/selectors/dashTypedSelectors';
import {getUrlGlobalParams} from '../../utils/url';
import Body from '../Body/Body';
import Dialogs from '../Dialogs/Dialogs';
import Header from '../Header/Header';

const AUTH_UPDATE_TIMEOUT = 40 * 60 * 1000;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;
type OwnProps = {};

type DashProps = StateProps & DispatchProps & RouteComponentProps & OwnProps;

type DashState = {
    isEditModeLoading: boolean;
};

class DashComponent extends React.PureComponent<DashProps, DashState> {
    authUpdateTimerId: NodeJS.Timeout | undefined = undefined;
    lockExtendTimerId: NodeJS.Timeout | undefined = undefined;

    state: DashState = {
        isEditModeLoading: false,
    };

    private entryDialoguesRef = React.createRef<EntryDialogues>();

    componentDidMount() {
        const {extractEntryId} = registry.common.functions.getAll();
        const entryId = extractEntryId(this.props.location.pathname);
        const {entry, lockToken, history, location, match} = this.props;

        if (entry?.entryId !== entryId) {
            this.props.loadDash({
                history: history,
                location: location,
                params: match.params,
            });
        }

        if (Utils.isEnabledFeature(Feature.AuthUpdateWithTimeout)) {
            this.setAuthUpdateTimeout();
        }

        // Fix case when open dash in edit mode then open dataset via navigation then click browser's back button.
        // We set lockToken again
        if (entryId && !entry?.fake && this.props.isEditMode && lockToken === null) {
            this.props.setLock(entryId, false, false);
        }

        window.addEventListener('beforeunload', this.unloadConfirmation);
    }

    componentDidUpdate(prevProps: DashProps) {
        const currentLocation = this.props.location;
        const prevLocation = prevProps.location;

        const {extractEntryId} = registry.common.functions.getAll();
        const entryId = extractEntryId(currentLocation.pathname);
        const prevEntryId = extractEntryId(prevLocation.pathname);

        const isFakeEntry = this.props.entry?.fake || !entryId;

        const currentSearchParams = new URLSearchParams(currentLocation.search);
        const prevSearchParams = new URLSearchParams(prevLocation.search);

        const revId = currentSearchParams.get(URL_QUERY.REV_ID);
        const prevRevId = prevSearchParams.get(URL_QUERY.REV_ID);

        const showOpenedDescription = currentSearchParams.get(URL_QUERY.OPEN_DASH_INFO);
        const prevShowOpenedDescription = prevSearchParams.get(URL_QUERY.OPEN_DASH_INFO);

        const showOpenedDescriptionChanged =
            (showOpenedDescription || prevShowOpenedDescription) &&
            showOpenedDescription !== prevShowOpenedDescription;

        if (showOpenedDescriptionChanged) {
            this.props.updateDashOpenedDesc(showOpenedDescription === '1');
        }

        const tabId =
            currentSearchParams.get(URL_QUERY.TAB_ID) ||
            (this.props.tabs && this.props.tabs[0].id) ||
            null;
        const prevTabId = prevSearchParams.get(URL_QUERY.TAB_ID);

        const currentPath = currentSearchParams.get(URL_QUERY.CURRENT_PATH);
        const prevCurrentPath = prevSearchParams.get(URL_QUERY.CURRENT_PATH);

        const hasEntryChanged = entryId !== prevEntryId;
        const hasRevisionChanged = revId !== prevRevId;
        // In case of switching between workbooks and folders while creating a dash and for updating along with the currentPath in query
        const hasPathChanged =
            isFakeEntry &&
            (prevLocation.pathname !== currentLocation.pathname || prevCurrentPath !== currentPath);

        const workbookId = this.props.entry?.workbookId;
        const prevWorkbookId = prevProps.entry?.workbookId;

        if (hasEntryChanged) {
            this.props.cleanRevisions();
            this.props.setRevisionsMode(RevisionsMode.Closed);
        }

        if (hasEntryChanged || hasRevisionChanged || hasPathChanged) {
            this.props.loadDash({
                history: this.props.history,
                location: this.props.location,
                params: this.props.match.params,
            });
        }

        if (!hasPathChanged && tabId && prevTabId !== tabId && this.props.tabId !== tabId) {
            this.props.setPageTab(tabId);
        }

        this.updateMobileWorkbooksData(prevWorkbookId, workbookId);

        if (isFakeEntry) {
            return;
        }

        this.updateLock(prevProps.isEditMode, this.props.isEditMode);
    }

    componentDidCatch(error: Error) {
        logger.logError('Dash componentDidCatch', error);
        this.props.setErrorMode(error);
        this.forceUpdate();
    }

    componentWillUnmount() {
        clearTimeout(this.authUpdateTimerId as NodeJS.Timeout);
        clearTimeout(this.lockExtendTimerId as NodeJS.Timeout);

        window.removeEventListener('beforeunload', this.unloadConfirmation);
    }

    // we update the cookie for the case when the dashboard is from under a zombie/robot
    // with auto-update and blackbox gives NEED_RESET
    authUpdate = () => {
        return axiosInstance({
            url: `${window.DL.endpoints.passportHost}/auth/update`,
            headers: {
                'x-csrf-token': NULL_HEADER,
            },
            'axios-retry': {
                retries: 1,
            },
        })
            .catch((error) => logger.logError('AUTH_UPDATE', error))
            .finally(this.setAuthUpdateTimeout);
    };

    setAuthUpdateTimeout = () => {
        clearTimeout(this.authUpdateTimerId as NodeJS.Timeout);
        this.authUpdateTimerId = setTimeout(this.authUpdate, AUTH_UPDATE_TIMEOUT);
    };

    // TODO: if 404, then report or create a lock
    // TODO: if 423, then report
    // CHARTS-6671
    extendLock = () => {
        if (!this.props.lockToken) {
            return;
        }
        return getSdk()
            .us.extendLock({
                entryId: this.props.entry.entryId,
                data: {lockToken: this.props.lockToken, duration: LOCK_DURATION},
            })
            .catch((error) => logger.logError('LOCK_EXTEND', error))
            .finally(this.setLockExtendTimeout);
    };

    setLockExtendTimeout = () => {
        clearTimeout(this.lockExtendTimerId as NodeJS.Timeout);
        this.lockExtendTimerId = setTimeout(this.extendLock, LOCK_EXTEND_TIMEOUT);
    };

    deleteLock = () => {
        this.props.deleteLock();
    };

    unloadConfirmation = (event: BeforeUnloadEvent) => {
        const message = i18n('toast_unsaved');
        // in particular, we bypass the case when the dashboard scheme has been updated, but there are no editing rights
        // TODO: isEditMode should suffice instead of CanEdit
        if (this.props.isEditMode && this.props.isDraft && this.props.canEdit) {
            (event || window.event).returnValue = message;
            return message;
        }
        return null;
    };

    render() {
        const {entry, tabs, tabId, history, location, dashGlobalDefaultParams, settings} =
            this.props;
        const subtitle = getTabTitleById({tabs, tabId});

        return (
            <React.Fragment>
                <PageTitle entry={entry} extraSettings={{subtitle}} />
                <SlugifyUrl
                    entryId={entry ? entry.entryId : null}
                    name={entry ? Utils.getEntryNameFromKey(entry.key) : null}
                    history={history}
                />
                <AccessRightsUrlOpen history={history} />
                <Header
                    entryDialoguesRef={this.entryDialoguesRef}
                    handlerEditClick={this.handlerEditClick}
                    history={history}
                    location={location}
                    isEditModeLoading={this.state.isEditModeLoading}
                />
                <Body
                    onRetry={this.handleRetry}
                    handlerEditClick={this.handlerEditClick}
                    isEditModeLoading={this.state.isEditModeLoading}
                    onPasteItem={this.onPasteItem}
                    globalParams={getUrlGlobalParams(location.search, dashGlobalDefaultParams)}
                    dashkitSettings={this.getDashkitSettings(settings)}
                    enableState={true}
                />
                <Dialogs />
            </React.Fragment>
        );
    }

    private getDashkitSettings = (settings: DashSettings) => {
        return getDashkitSettings(settings);
    };

    private setExpandedRevisions = () => {
        this.props.setRevisionsMode?.(RevisionsMode.Opened);
        this.props.setRevisionsListMode?.(RevisionsListMode.Expanded);
    };

    private setEditMode = async () => {
        try {
            this.setState({isEditModeLoading: true});
            await this.props.setEditMode();
        } catch (error) {
            logger.logError('dash Header: setEditMode failed', error);
        }
        this.setState({isEditModeLoading: false});
    };

    private setEditDash = () => {
        this.props.setRevisionsMode?.(RevisionsMode.Closed);
        this.setEditMode();
    };

    private handlerEditClick = () => {
        const {savedId, publishedId, revId} = this.props.entry;
        const hasLatestUnpublishedVersion = savedId !== publishedId && savedId !== revId;

        if (hasLatestUnpublishedVersion) {
            this.entryDialoguesRef.current?.open({
                dialog: EntryDialogName.EditWarning,
                dialogProps: {
                    onEditClick: this.setEditDash,
                    onShowHistoryClick: this.setExpandedRevisions,
                },
            });
            return;
        }

        this.setEditDash();
    };

    private handleRetry = () => {
        const {history, location, match} = this.props;
        this.props.loadDash({
            history,
            location,
            params: match.params,
        });
    };

    private showErrorPasteItemFromWorkbook() {
        const message = (
            <Interpolate
                text={i18n('warning_paste-invalid-workbook-entry')}
                matches={{
                    link(match) {
                        return (
                            <Link
                                view="normal"
                                target="_blank"
                                href={formDocsEndpointDL('/workbooks-collections/migrations')}
                            >
                                {match}
                            </Link>
                        );
                    },
                }}
            />
        );

        this.props.showToast({
            title: i18n('toast_paste-invalid-workbook-entry'),
            type: 'danger',
            actions: [
                {
                    label: i18n('label_details'),
                    onClick: () => {
                        this.props.openWarningDialog({
                            closeOnEnterPress: true,
                            message,
                            buttonView: 'normal',
                            onApply: this.props.closeDialog,
                        });
                    },
                },
            ],
        });
    }

    private onPasteItem = (itemData: CopiedConfigData, updateLayout?: ConfigLayout[]) => {
        if (!isItemPasteAllowed(itemData, this.props.entry.workbookId)) {
            this.showErrorPasteItemFromWorkbook();
            return;
        }

        const pastedItemData = itemData.data;

        if (itemData.type === ITEM_TYPE.WIDGET) {
            pastedItemData.tabs =
                itemData.data.tabs &&
                itemData.data.tabs.map((tab) => {
                    return update(tab, {
                        $unset: ['id'],
                    });
                });
        }

        if (itemData.type === ITEM_TYPE.GROUP_CONTROL) {
            pastedItemData.group = pastedItemData.group?.map((item) => {
                return update(item, {$unset: ['id']});
            });
        }

        const data = update(pastedItemData, {$unset: ['id']});

        this.props.setCopiedItemData({
            item: {
                data,
                type: itemData.type,
                defaults: itemData.defaults,
                namespace: itemData.namespace,
                layout: itemData?.layout,
            },
            options: {
                updateLayout,
            },
        });
    };

    private updateLock = (prevIsEditMode: boolean, isEditMode: boolean) => {
        if (prevIsEditMode && !isEditMode) {
            // exited editing mode
            clearTimeout(this.lockExtendTimerId as NodeJS.Timeout);
            this.deleteLock();
        } else if (!prevIsEditMode && isEditMode) {
            // entered editing mode
            this.setLockExtendTimeout();
        }
    };

    private updateMobileWorkbooksData = (prevWorkbookId?: string, workbookId?: string) => {
        if (!DL.IS_MOBILE) {
            return;
        }

        if (prevWorkbookId !== workbookId && workbookId) {
            this.props.addWorkbookInfo(workbookId);
        }

        if (prevWorkbookId && !workbookId) {
            this.props.resetWorkbookPermissions();
        }
    };
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    isDraft: isDraft(state),
    isEditMode: isEditMode(state),
    canEdit: canEdit(state),
    entry: selectDashEntry(state),
    lockToken: selectLockToken(state),
    revId: selectEntryContentRevId(state),
    tabs: selectTabs(state),
    tabId: selectTabId(state),
    dashGlobalDefaultParams: selectDashGlobalDefaultParams(state),
    settings: selectSettings(state),
});

const mapDispatchToProps = {
    setRevisionsMode,
    setRevisionsListMode,
    loadDash,
    setErrorMode,
    cleanLock,
    deleteLock,
    setLock,
    cleanRevisions,
    setPageTab,
    setEditMode,
    setCopiedItemData,
    addWorkbookInfo,
    resetWorkbookPermissions,
    showToast,
    openWarningDialog,
    closeDialog,
    updateDashOpenedDesc,
};

export const DashWrapper = connect(mapStateToProps, mapDispatchToProps)(DashComponent);
