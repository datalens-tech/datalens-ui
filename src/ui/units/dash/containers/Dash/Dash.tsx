import React from 'react';

import {AccessRightsUrlOpen} from 'components/AccessRights/AccessRightsUrlOpen';
import {i18n} from 'i18n';
import update from 'immutability-helper';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import {ResolveThunks, connect} from 'react-redux';
import {RouteComponentProps} from 'react-router-dom';
import {Feature, extractEntryId} from 'shared';
import {EntryDialogName, EntryDialogues} from 'ui/components/EntryDialogues';
import {PageTitle} from 'ui/components/PageTitle';
import {SlugifyUrl} from 'ui/components/SlugifyUrl';
import {DL, URL_QUERY} from 'ui/constants';
import {DatalensGlobalState} from 'ui/index';
import {axiosInstance} from 'ui/libs';
import {NULL_HEADER} from 'ui/libs/axios/axios';
import {addWorkbookInfo, resetWorkbookPermissions} from 'ui/units/workbooks/store/actions';
import Utils from 'ui/utils';

import {
    cleanRevisions,
    setRevisionsListMode,
    setRevisionsMode,
} from '../../../../store/actions/entryContent';
import {selectEntryContentRevId, selectLockToken} from '../../../../store/selectors/entryContent';
import {RevisionsListMode, RevisionsMode} from '../../../../store/typings/entryContent';
import {ITEM_TYPE} from '../../containers/Dialogs/constants';
import {LOCK_DURATION, LOCK_EXTEND_TIMEOUT} from '../../modules/constants';
import {CopiedConfigData, getTabTitleById} from '../../modules/helpers';
import {
    cleanLock,
    deleteLock,
    load as loadDash,
    setCopiedItemData,
    setEditMode,
    setLock,
} from '../../store/actions/dash';
import {setErrorMode, setPageTab} from '../../store/actions/dashTyped';
import {
    canEdit,
    isDraft,
    isEditMode,
    selectDashEntry,
    selectTabId,
    selectTabs,
} from '../../store/selectors/dashTypedSelectors';
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
        if (!entry?.fake && this.props.isEditMode && lockToken === null) {
            this.props.setLock(entryId, false, false);
        }

        window.addEventListener('beforeunload', this.unloadConfirmation);
    }

    componentDidUpdate(prevProps: DashProps) {
        const currentLocation = this.props.location;
        const prevLocation = prevProps.location;

        const entryId = extractEntryId(currentLocation.pathname);
        const prevEntryId = extractEntryId(prevLocation.pathname);

        const isFakeEntry = this.props.entry?.fake || !entryId;

        const currentSearchParams = new URLSearchParams(currentLocation.search);
        const prevSearchParams = new URLSearchParams(prevLocation.search);

        const revId = currentSearchParams.get(URL_QUERY.REV_ID);
        const prevRevId = prevSearchParams.get(URL_QUERY.REV_ID);

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
        const message = i18n('dash.main.view', 'toast_unsaved');
        // in particular, we bypass the case when the dashboard scheme has been updated, but there are no editing rights
        // TODO: isEditMode should suffice instead of CanEdit
        if (this.props.isEditMode && this.props.isDraft && this.props.canEdit) {
            (event || window.event).returnValue = message;
            return message;
        }
        return null;
    };

    render() {
        const {entry, tabs, tabId, history, location} = this.props;
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
                    handlerEditClick={this.handlerEditClick}
                    isEditModeLoading={this.state.isEditModeLoading}
                    onPasteItem={this.onPasteItem}
                />
                <Dialogs />
            </React.Fragment>
        );
    }

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

    private onPasteItem = (itemData: CopiedConfigData) => {
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

        const data = update(pastedItemData, {$unset: ['id']});

        this.props.setCopiedItemData({
            data,
            type: itemData.type,
            defaults: itemData.defaults,
            namespace: itemData.namespace,
            layout: itemData?.layout,
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
};

export const DashWrapper = connect(mapStateToProps, mapDispatchToProps)(DashComponent);
