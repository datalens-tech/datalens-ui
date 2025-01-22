import React from 'react';

import {Dialog, Spin} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import get from 'lodash/get';
import moment from 'moment';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {filterUsersIds} from 'shared';
import {showToast} from 'store/actions/toaster';
import {getResolveUsersByIdsAction} from 'store/actions/usersByIds';
import {registry} from 'ui/registry';

import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {DIALOG_RESOLVE_STATUS, Status, TIMESTAMP_FORMAT} from '../../constants/common';
import type {EditorEntry} from '../../types/common';
import type {RevisionEntry} from '../../types/revisions';
import {RevisionAction} from '../../types/revisions';
import type {ScriptsValues, TabData} from '../../types/store';
import Dialogs from '../Dialogs/Dialogs';
import {PaginationList} from '../PaginationList/PaginationList';
import {ViewAsync} from '../ViewAsync/ViewAsync';

import {ButtonRevisionsDiff} from './ButtonRevisionsDiff/ButtonRevisionsDiff';
import {DropdownActions} from './DropdownActions/DropdownActions';

import './Revisions.scss';

export interface ChangeRevisionData {
    action: RevisionAction;
    revisionEntry: RevisionEntry;
}

export interface RevisionsProps extends RouteComponentProps {
    visible: boolean;
    onClose: () => void;
    entry: EditorEntry;
    tabsData: TabData[];
    scriptsValues: ScriptsValues;
    isScriptsChanged: boolean;
    onChangeRevision: (
        data: ChangeRevisionData,
        history: RouteComponentProps['history'],
        location: RouteComponentProps['location'],
    ) => void;
    progress: {
        action: RevisionAction;
        revId: string;
    } | null;
}

export interface RevisionsState {
    status: Status;
    items: RevisionEntry[];
    hasNextPage: boolean;
    page: number;
    onceLoading: boolean;
    loadMore: boolean;
}

const i18n = I18n.keyset('component.dialog-revisions.view');
const b = block('dialog-revisions');

function getProgressText(action: RevisionAction) {
    switch (action) {
        case RevisionAction.Open:
            return i18n('label_progress-open');
        case RevisionAction.Publish:
            return i18n('label_progress-publishing');
        case RevisionAction.Reset:
            return i18n('label_progress-reset');
        default:
            return '';
    }
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = RevisionsProps & DispatchProps;

class Revisions extends React.Component<Props, RevisionsState> {
    state: RevisionsState = {
        status: Status.Loading,
        items: [],
        hasNextPage: false,
        page: 0,
        onceLoading: false,
        loadMore: false,
    };

    private isUnmounted = false;
    private dialogsRef = React.createRef<Dialogs>();
    private paginationListRef = React.createRef<PaginationList>();

    componentDidMount() {
        this.getRevisions();
    }

    componentDidUpdate(prevProps: RevisionsProps) {
        if (prevProps !== this.props) {
            if (
                this.props.progress === null &&
                get(prevProps.progress, ['action']) === RevisionAction.Reset
            ) {
                this.reset();
            }
            if (this.paginationListRef.current) {
                this.paginationListRef.current.refresh();
            }
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {visible, onClose, isScriptsChanged, tabsData, scriptsValues, entry} = this.props;
        const {status, items, loadMore, hasNextPage} = this.state;

        return (
            <Dialog open={visible} onClose={onClose}>
                <Dialog.Header caption={i18n('section_title')} />
                <Dialog.Body className={b()}>
                    <ViewAsync status={status} onRetry={this.getRevisions}>
                        <div className={b('content')}>
                            {(items.length > 1 || isScriptsChanged) && (
                                <ButtonRevisionsDiff
                                    className={b('btn-diff')}
                                    tabsData={tabsData}
                                    scriptsValues={scriptsValues}
                                    isScriptsChanged={isScriptsChanged}
                                    entry={entry}
                                />
                            )}
                            <div className={b('pagination-list-place')}>
                                <PaginationList
                                    ref={this.paginationListRef}
                                    items={items}
                                    loading={loadMore}
                                    hasNextPage={hasNextPage}
                                    onLoadMore={this.getRevisions}
                                    rowRenderer={this.rowRenderer}
                                />
                            </div>
                        </div>
                    </ViewAsync>
                    <Dialogs ref={this.dialogsRef} />
                </Dialog.Body>
            </Dialog>
        );
    }

    private reset() {
        this.setState(
            {
                status: Status.Loading,
                items: [],
                hasNextPage: false,
                page: 0,
                onceLoading: false,
            },
            this.getRevisions,
        );
    }

    private getRevisions = async () => {
        try {
            if (this.state.onceLoading) {
                this.setState({loadMore: true});
            } else {
                this.setState({status: Status.Loading, loadMore: true});
            }
            const {entry} = this.props;
            const {hasNextPage, entries} = await getSdk().sdk.us.getRevisions({
                entryId: entry.entryId,
                pageSize: 100,
                page: this.state.page,
            });
            const ids = filterUsersIds(entries.map((item) => item.updatedBy));
            this.props.resolveUsersByIds(ids);
            if (this.isUnmounted) {
                return;
            }
            this.setState((prevState) => ({
                hasNextPage,
                items: [...prevState.items, ...entries],
                page: prevState.page + 1,
                onceLoading: true,
                status: Status.Success,
                loadMore: false,
            }));
        } catch (error) {
            logger.logError('Revisions: getRevisions failed', error);
            if (this.isUnmounted) {
                return;
            }
            this.props.showToast({
                title: i18n('toast_get-revisions-failed'),
                name: 'getRevisionsFailed',
                error,
                withReport: true,
            });
            this.setState({status: Status.Failed, loadMore: false});
        }
    };

    private renderActions = ({
        item,
        current,
        published,
    }: {
        item: RevisionEntry;
        current: boolean;
        published: boolean;
    }) => {
        const {entry, progress} = this.props;
        const editable = entry.permissions.edit;
        const latest = item.revId === item.savedId;

        const showActions = !current || (editable && (!latest || !published));

        if (!showActions) {
            return null;
        }

        return (
            <div onClick={(event) => event.stopPropagation()} className={b('dropdown')}>
                <DropdownActions
                    editable={editable}
                    disabled={Boolean(progress)}
                    published={published}
                    latest={latest}
                    current={current}
                    onClick={(action: RevisionAction) =>
                        this.onItemClick({
                            action,
                            revisionEntry: item,
                        })
                    }
                />
            </div>
        );
    };

    private rowRenderer = ({item}: {item: RevisionEntry}) => {
        const {entry, progress} = this.props;
        const current = entry.revId === item.revId;
        const published = entry.publishedId === item.revId;
        const isReleased: boolean = get(item, ['meta', 'is_release'], false);
        const updatedBy = item.updatedBy;

        const {getLoginById} = registry.common.functions.getAll();
        const LoginById = getLoginById();

        return (
            <div
                className={b('item', {current})}
                onClick={() => {
                    if (current || Boolean(progress)) {
                        return;
                    }
                    this.onItemClick({
                        action: RevisionAction.Open,
                        revisionEntry: item,
                    });
                }}
            >
                <div className={b('release-status')}>
                    {isReleased && (
                        <div
                            className={b('release-mark')}
                            title={i18n('label_tooltip-published')}
                        />
                    )}
                </div>
                <div className={b('time-version')}>
                    {Boolean(item.updatedAt) && (
                        <div className={b('updatedAt')}>
                            <span>{moment(item.updatedAt).format(TIMESTAMP_FORMAT)}</span>
                        </div>
                    )}
                </div>
                <div className={b('user')}>
                    {LoginById && (
                        <span
                            onClick={(event) => event.stopPropagation()}
                            className={b('user-wrap')}
                        >
                            <LoginById loginOrId={updatedBy} view="secondary" />
                        </span>
                    )}
                </div>
                <div className={b('publish-status')}>
                    {published && i18n('label_status-published')}
                </div>

                <div className={b('actions')}>
                    {progress !== null && progress.revId === item.revId ? (
                        <div className={b('progress-status')}>
                            <Spin className={b('spin')} size="xs" />
                            <div className={b('progress-text')}>
                                {getProgressText(progress.action)}
                            </div>
                        </div>
                    ) : (
                        this.renderActions({item, current, published})
                    )}
                </div>
            </div>
        );
    };

    private async onItemClick(data: ChangeRevisionData) {
        const {entry, isScriptsChanged, onChangeRevision, history, location} = this.props;
        const editable = entry.permissions.edit;
        const {action} = data;
        const isEffectAction = action === RevisionAction.Open || action === RevisionAction.Reset;
        if (isScriptsChanged && editable && isEffectAction && this.dialogsRef.current) {
            const response = await this.dialogsRef.current.open({
                dialog: Dialogs.DIALOG.CONFIRM_WARNING,
                dialogProps: {
                    message: i18n('toast_warning-has-no-saved-changes'),
                },
            });
            if (response.status === DIALOG_RESOLVE_STATUS.SUCCESS) {
                onChangeRevision(data, history, location);
            }
        } else {
            onChangeRevision(data, history, location);
        }
    }
}

const mapDispatchToProps = {
    showToast,
    resolveUsersByIds: getResolveUsersByIdsAction(),
};

export default connect(null, mapDispatchToProps)(withRouter(Revisions));
