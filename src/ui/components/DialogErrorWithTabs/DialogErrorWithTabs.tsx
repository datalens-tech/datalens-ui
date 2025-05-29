import React from 'react';

import {Button, Loader, Tab, TabList, TabProvider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import type {DataLensApiError} from 'ui';
import {SHEET_IDS} from 'ui';
import {DL} from 'ui/constants/common';
import {registry} from 'ui/registry';
import type {FetchDocumentationArgs} from 'ui/registry/units/common/types/functions/fetchDocumentation';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import logger from '../../libs/logger';
import {parseError} from '../../utils/errors/parse';
import {AdaptiveDialog} from '../AdaptiveDialog/AdaptiveDialog';
import DialogManager from '../DialogManager/DialogManager';

import DebugInfo from './DebugInfo/DebugInfo';
import DatabaseRequestTab from './Tabs/DatabaseRequestTab/DatabaseRequestTab';
import DatabaseResponseTab from './Tabs/DatabaseResponseTab/DatabaseResponseTab';
import DebugTab from './Tabs/DebugTab/DebugTab';
import DocumentationTab from './Tabs/DocumentationTab/DocumentationTab';

import './DialogErrorWithTabs.scss';

const NOT_FOUND_STATUS_CODE = 404;

enum DialogErrorTabId {
    Doc = 'tab_doc',
    DbRequest = 'tab_db-request',
    DbResponse = 'tab_db-response',
    Debug = 'tab_debug',
}

type DialogErrorTabItemProps = {
    id: DialogErrorTabId;
    title: string;
};

type DatabaseErrorDetails = {
    details?: {
        db_message?: string;
        query?: string;
    };
    debug?: {
        db_message?: string;
        query?: string;
    };
    code?: string;
};

export type DialogErrorWithTabsProps = {
    onCancel: () => void;
    title: string | null;
    withReport?: boolean;
    onRetry?: () => void;
    importId?: string;
    exportId?: string;
} & (
    | {
          // When providing an error object
          error: DataLensApiError;
          details?: never;
      }
    | {
          // When providing custom debug details
          error?: never;
          details: string;
      }
);

type State = {
    requestId: string;
    loading: boolean;
    activeTabId?: DialogErrorTabId;
    code?: string;
    traceId?: string;
    details?: Record<string, string>;
    db_message?: string;
    db_query?: string;
    documentation: string | null;
    errorWithoutDocumentation?: string;
    tabsList: DialogErrorTabItemProps[];
};

const b = block('dl-dialog-error');
const i18n = I18n.keyset('component.error-dialog.view');

export const DIALOG_ERROR_WITH_TABS = Symbol('DIALOG_ERROR_WITH_TABS');
export type OpenDialogErrorWithTabsArgs = {
    id: typeof DIALOG_ERROR_WITH_TABS;
    props: DialogErrorWithTabsProps;
};

class DialogErrorWithTabs extends React.Component<DialogErrorWithTabsProps, State> {
    TABS: Record<DialogErrorTabId, DialogErrorTabItemProps> = {
        [DialogErrorTabId.Doc]: {
            id: DialogErrorTabId.Doc,
            title: i18n('tab_doc'),
        },
        [DialogErrorTabId.DbResponse]: {
            id: DialogErrorTabId.DbResponse,
            title: i18n('tab_db-response'),
        },
        [DialogErrorTabId.DbRequest]: {
            id: DialogErrorTabId.DbRequest,
            title: i18n('tab_db-request'),
        },
        [DialogErrorTabId.Debug]: {
            id: DialogErrorTabId.Debug,
            title: i18n('tab_debug'),
        },
    };

    state: State = {
        requestId: DL.REQUEST_ID,
        loading: true,
        documentation: null,
        tabsList: [this.TABS[DialogErrorTabId.Debug]],
    };

    isUnmounted = false;

    fetchDocumentation(args: FetchDocumentationArgs) {
        const fetchDocumentation = registry.common.functions.get('fetchDocumentation');
        return fetchDocumentation(args);
    }

    async componentDidMount() {
        if ('error' in this.props && this.props.error) {
            await this.prepareDialogError(this.props.error);
        } else if ('details' in this.props && this.props.details) {
            // If only details are provided, just show the Debug tab
            this.setState({
                tabsList: [this.TABS[DialogErrorTabId.Debug]],
                activeTabId: DialogErrorTabId.Debug,
            });
        }

        this.setState({loading: false});
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {title} = this.props;
        const {loading} = this.state;

        return (
            <AdaptiveDialog
                visible={true}
                onClose={this.onClose}
                sheetContentClassName={b({mobile: true})}
                dialogBodyClassName={b('content')}
                renderSheetFooter={() => this.renderFooterButtons()}
                renderDialogFooter={() => this.renderFooterButtons()}
                title={title || i18n('label_error')}
                dialogProps={{
                    disableEscapeKeyDown: true,
                    disableOutsideClick: true,
                    className: b(),
                }}
                dialogHeaderProps={{className: b('header')}}
                dialogFooterProps={{
                    preset: 'default',
                    showError: false,
                    onClickButtonCancel: this.onClose,
                    textButtonCancel: i18n('button_close'),
                    loading: false,
                }}
                id={SHEET_IDS.DIALOG_ERROR}
            >
                {loading ? this.renderLoader() : this.renderDialogBody()}
            </AdaptiveDialog>
        );
    }

    private async fetchErrorDocumentation(errorCode: string) {
        try {
            const response = await this.fetchDocumentation({
                lang: DL.USER_LANG,
                path: `/${errorCode.replace(/\./g, '-')}`,
            });
            if (this.isUnmounted) {
                return null;
            }
            return response.html;
        } catch (docError) {
            if (this.isUnmounted) {
                return null;
            }
            if (docError.status === NOT_FOUND_STATUS_CODE) {
                this.setState({errorWithoutDocumentation: errorCode});
            }
            logger.logError('getErrorDocumentation:', docError);
            return null;
        }
    }

    private async prepareDialogError(error: DataLensApiError) {
        const parsedError = parseError(error);

        const state: Partial<State> = {
            code: parsedError.code,
            details: parsedError.details,
            requestId: parsedError.requestId,
            traceId: parsedError.traceId,
        };

        const detailsKeys = Object.keys(state.details || {});

        detailsKeys.forEach((key) => {
            const sourceErrorDetails = (parsedError.details[key] as DatabaseErrorDetails) || null;
            if (sourceErrorDetails) {
                state.code = sourceErrorDetails?.code;
                state.db_message =
                    sourceErrorDetails?.details?.db_message ||
                    sourceErrorDetails?.debug?.db_message;
                state.db_query =
                    sourceErrorDetails?.details?.query || sourceErrorDetails?.debug?.query;
            }
        });

        if (state.code && isEnabledFeature(Feature.FetchDocumentation)) {
            state.documentation = await this.fetchErrorDocumentation(state.code);
        }

        if (this.isUnmounted) {
            return;
        }

        this.setState((prevState) => ({...prevState, ...state}), this.prepareTabs);
    }

    private prepareTabs() {
        let tabsList = this.state.tabsList;

        if (this.state.documentation) {
            tabsList = this.addTabToList(DialogErrorTabId.Doc, 0, tabsList);
        }

        if (this.state.db_message) {
            tabsList = this.addTabToList(DialogErrorTabId.DbResponse, 1, tabsList);
        }

        if (this.state.db_query) {
            tabsList = this.addTabToList(DialogErrorTabId.DbRequest, 2, tabsList);
        }

        this.setState({activeTabId: tabsList[0].id, tabsList});
    }

    private renderTabContent(activeTabId?: DialogErrorTabId) {
        switch (activeTabId) {
            case DialogErrorTabId.Debug:
                return <DebugTab error={this.props.error} details={this.props.details} />;

            case DialogErrorTabId.Doc:
                return <DocumentationTab documentation={this.state.documentation} />;
            case DialogErrorTabId.DbRequest:
                return <DatabaseRequestTab query={this.state.db_query} />;
            case DialogErrorTabId.DbResponse:
                return <DatabaseResponseTab message={this.state.db_message} />;
            default:
                return null;
        }
    }

    private renderDialogBody() {
        return (
            <React.Fragment>
                <DebugInfo
                    requestId={this.state.requestId}
                    traceId={this.state.traceId}
                    importId={this.props.importId}
                    exportId={this.props.exportId}
                />
                <TabProvider value={this.state.activeTabId} onUpdate={this.onTabClick}>
                    <TabList
                        className={b('tab-navigation')}
                        size={DL.IS_MOBILE ? MOBILE_SIZE.TABS : 'm'}
                    >
                        {this.state.tabsList.map((item) => (
                            <Tab key={item.id} value={item.id}>
                                {item.title}
                            </Tab>
                        ))}
                    </TabList>
                </TabProvider>
                {this.renderTabContent(this.state.activeTabId)}
            </React.Fragment>
        );
    }

    private renderLoader() {
        return <Loader size="m" className={b('loader')} />;
    }

    private renderFooterButtons() {
        const {title, withReport = true, onRetry} = this.props;

        // Only show report button if error is provided
        const showReport = withReport && 'error' in this.props && this.props.error;
        const {requestId, errorWithoutDocumentation} = this.state;

        const {ReportButton} = registry.common.components.getAll();

        const buttonsSize = DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : 'l';

        return (
            <div className={b('footer-buttons')}>
                {showReport && (
                    <ReportButton
                        error={this.props.error}
                        message={title || i18n('label_error')}
                        requestId={requestId}
                        errorWithoutDocumentation={errorWithoutDocumentation}
                        className={b('button')}
                        size={buttonsSize}
                        view={DL.IS_MOBILE ? 'outlined' : 'flat'}
                    />
                )}
                {typeof onRetry === 'function' && (
                    <Button
                        size={buttonsSize}
                        view={DL.IS_MOBILE ? 'action' : 'outlined'}
                        onClick={onRetry}
                        className={b('button')}
                    >
                        {i18n('button_retry')}
                    </Button>
                )}
            </div>
        );
    }

    private onClose = () => {
        this.props.onCancel();
    };

    private onTabClick = (tabId: string) => {
        this.setState({activeTabId: tabId as DialogErrorTabId});
    };

    private addTabToList(
        tabId: DialogErrorTabId,
        position: number,
        tabsList: DialogErrorTabItemProps[],
    ) {
        const newTabs = [...tabsList];
        newTabs.splice(position, 0, this.TABS[tabId]);
        return newTabs;
    }
}

DialogManager.registerDialog(DIALOG_ERROR_WITH_TABS, DialogErrorWithTabs);
