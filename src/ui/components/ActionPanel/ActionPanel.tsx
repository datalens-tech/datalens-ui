import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {Dispatch, bindActionCreators} from 'redux';
import {ActionPanelQA, Feature} from 'shared';
import {
    cleanRevisions,
    fetchEntryById,
    setEntryContent,
    setEntryCurrentRevId,
    setRevisionsListMode,
    setRevisionsMode,
} from 'store/actions/entryContent';
import {selectAsideHeaderData} from 'store/selectors/asideHeader';
import {selectEntryContent, selectIsRevisionsOpened} from 'store/selectors/entryContent';
import {RevisionsListMode, RevisionsMode} from 'store/typings/entryContent';
import {registry} from 'ui/registry';
import Utils from 'ui/utils';

import type {GetEntryResponse} from '../../../shared/schema';
import {DatalensGlobalState} from '../../index';
import {getSdk} from '../../libs/schematic-sdk';
import {EntryContextMenuItems} from '../EntryContextMenu/helpers';
import ExpandablePanel from '../ExpandablePanel/ExpandablePanel';
import Revisions from '../Revisions/Revisions';
import RevisionsPanel from '../RevisionsPanel/RevisionsPanel';

import EntryPanel from './components/EntryPanel/EntryPanel';

import './ActionPanel.scss';

const b = block('action-panel');
const i18n = I18n.keyset('component.action-panel.view');

type StateProps = ReturnType<typeof mapStateToProps>;

type OwnProps = {
    entryId?: string;
    entry?: GetEntryResponse;
    additionalEntryItems?: EntryContextMenuItems;
    leftItems?: React.ReactNode | React.ReactNode[];
    centerItems?: React.ReactNode[];
    rightItems?: React.ReactNode | React.ReactNode[];
    className?: string;
    enablePublish?: boolean;
    setActualVersion?: () => void;
    isEditing?: boolean;
};

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = Partial<StateProps> & OwnProps & DispatchProps & RouteComponentProps;

type State = {
    entry?: GetEntryResponse;
    isEditing: boolean;
};

class ActionPanel extends React.Component<Props, State> {
    static EntryPanel: typeof EntryPanel = EntryPanel;

    state: State = {
        isEditing: false,
    };

    concurrentId: string | null = null;

    componentDidMount() {
        const {entryId, actions} = this.props;

        if (entryId) {
            this.concurrentId = `fetchEntryById-${entryId}`;
            actions.fetchEntryById(entryId, this.concurrentId, (entry) => {
                this.setState({
                    entry,
                });
                this.setEntryContent();
            });
        } else {
            this.setEntryContent();
        }

        actions.cleanRevisions();
        actions.setRevisionsMode(RevisionsMode.Closed);
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        const {entry, actions, match} = this.props;
        const entryId = entry?.entryId;
        const prevEntryId = prevProps.entry?.entryId;
        const hasEntryChanged = entryId && prevEntryId && entryId !== prevEntryId;

        const {extractEntryId} = registry.common.functions.getAll();

        const oldPageEntryId = extractEntryId(prevProps.match.url);
        const newPageEntryId = extractEntryId(match.url);

        const hasPageEntryChanged = oldPageEntryId !== newPageEntryId;
        const hasPageEntryChangedWithId = hasPageEntryChanged && newPageEntryId;
        const hasEntryChangedWithId = entryId && !prevEntryId;
        const needCleanRevisions = hasEntryChanged || hasPageEntryChangedWithId;

        if (needCleanRevisions) {
            actions.cleanRevisions();
            actions.setRevisionsMode(RevisionsMode.Closed);
        }

        if (entryId !== null && (hasEntryChangedWithId || hasPageEntryChangedWithId)) {
            this.concurrentId = `fetchEntryById-${entryId}`;
            const fetchEntryId = hasPageEntryChangedWithId ? newPageEntryId! : entryId!;
            actions.fetchEntryById(fetchEntryId, this.concurrentId, (entryItem) => {
                this.concurrentId = null;
                this.setState({
                    entry: entryItem,
                });
                this.setEntryContent();
            });
        } else if (hasEntryChanged) {
            this.setEntryContent();
        }
    }

    componentWillUnmount() {
        if (this.concurrentId) {
            getSdk().cancelRequest(this.concurrentId);
        }
        this.props.actions.cleanRevisions();
        this.props.actions.setRevisionsMode(RevisionsMode.Closed);
    }

    render() {
        const {
            additionalEntryItems = [],
            leftItems,
            centerItems = [],
            rightItems,
            className: mix,
            enablePublish,
            sidebarSize,
            entryContent,
            isRevisionsOpened,
            setActualVersion,
            isEditing,
        } = this.props;

        const leftStyle: React.CSSProperties = {left: sidebarSize};

        const entry = this.getEntry();

        return (
            <React.Fragment>
                <div className={b()} data-qa={ActionPanelQA.ActionPanel}>
                    <div className={b('container', mix)} style={leftStyle}>
                        {Array.isArray(leftItems)
                            ? leftItems.map((LeftItems) => LeftItems)
                            : leftItems}
                        {entry && (
                            <EntryPanel
                                entry={entry}
                                additionalEntryItems={additionalEntryItems}
                                enablePublish={enablePublish}
                            >
                                {centerItems}
                            </EntryPanel>
                        )}
                        {Array.isArray(rightItems)
                            ? rightItems.map((RightItems) => RightItems)
                            : rightItems}
                    </div>
                </div>
                {entry && entryContent && setActualVersion && (
                    <React.Fragment>
                        <RevisionsPanel
                            entry={entry}
                            leftStyle={leftStyle}
                            onSetActualRevision={setActualVersion}
                            onOpenActualRevision={this.handleOpenCurrentRevision}
                            onOpenDraftRevision={this.handleOpenDraftRevision}
                            isEditing={isEditing || false}
                        />
                        <ExpandablePanel
                            title={i18n('label_history-changes')}
                            description={
                                Utils.isEnabledFeature(Feature.RevisionsListNoLimit)
                                    ? undefined
                                    : i18n('label_history-changes-date-limit')
                            }
                            active={isRevisionsOpened || false}
                            onClose={this.handleExpandablePanelClose}
                        >
                            <Revisions />
                        </ExpandablePanel>
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }

    private getEntry() {
        return this.props.entry || this.state.entry;
    }

    private setEntryContent() {
        const entry = this.getEntry();
        if (!entry?.entryId) {
            return;
        }

        this.props.actions.setEntry(entry);
    }

    private handleOpenDraftRevision = () => {
        this.props.actions.setEntryCurrentRevId(this.getEntry()?.savedId || '');
    };

    private handleOpenCurrentRevision = () => {
        this.props.actions.setEntryCurrentRevId(this.getEntry()?.publishedId || '');
    };

    private handleExpandablePanelClose = () => {
        const {setRevisionsListMode, setRevisionsMode, cleanRevisions} = this.props.actions;
        setRevisionsListMode(RevisionsListMode.Expanded);
        setRevisionsMode(RevisionsMode.Closed);
        cleanRevisions();
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        sidebarSize: selectAsideHeaderData(state).size || 0,
        entryContent: selectEntryContent(state),
        isRevisionsOpened: selectIsRevisionsOpened(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                setEntry: setEntryContent,
                setEntryCurrentRevId,
                setRevisionsMode,
                setRevisionsListMode,
                cleanRevisions,
                fetchEntryById,
            },
            dispatch,
        ),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ActionPanel));
