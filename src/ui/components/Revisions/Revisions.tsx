import React from 'react';

import {Loader, Spin} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Status, ViewAsync} from 'components/ViewAsync/ViewAsync';
import {I18n} from 'i18n';
import {getSdk} from 'libs/schematic-sdk';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import type {GetRevisionsEntry} from 'shared/schema';
import {showToast} from 'store/actions/toaster';
import type {DatalensGlobalState} from 'ui';
import {URL_QUERY} from 'ui';

import logger from '../../libs/logger';
import {loadRevisions, setEntryCurrentRevId} from '../../store/actions/entryContent';
import {
    selectEntryContentCurrentRevId,
    selectRevisionsItems,
} from '../../store/selectors/entryContent';
import history from '../../utils/history';

import {RevisionsList} from './RevisionsList/RevisionsList';
import {REVISIONS_LIST_DEBOUNCE_DELAY} from './helpers';

import './Revisions.scss';

export interface OwnProps extends RouteComponentProps {
    renderItemActions?: (item: GetRevisionsEntry, currentRevId: string) => React.ReactNode;
}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

interface State {
    status: Status;
    page: number;
    onceLoading: boolean;
    loadMore: boolean;
}

type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps;

const i18n = I18n.keyset('component.dialog-revisions.view');
const b = block('revisions');
const SCROLL_OFFSET = 20; // gap to start loading a little in advance
const CONCURRENT_ID = 'loadRevisions';

class Revisions extends React.Component<Props, State> {
    state: State = {
        status: Status.Loading,
        page: 0,
        onceLoading: false,
        loadMore: false,
    };

    private isUnmounted = false;
    private scrollableNodeRef = React.createRef<HTMLDivElement>();

    private onScroll = debounce(() => {
        const scrollableNode = this.scrollableNodeRef.current as HTMLDivElement;
        if (!scrollableNode) {
            return;
        }

        const hasScrolledToBottom =
            scrollableNode.scrollTop + scrollableNode.offsetHeight + SCROLL_OFFSET >=
            scrollableNode.scrollHeight;

        const needLoadRevisions =
            hasScrolledToBottom &&
            this.props.entryContent.hasRevisionsNextPage &&
            !this.state.loadMore;

        if (needLoadRevisions) {
            this.getRevisions();
        }
    }, REVISIONS_LIST_DEBOUNCE_DELAY);

    componentDidMount() {
        this.getRevisions();
    }

    componentWillUnmount() {
        getSdk().cancelRequest(CONCURRENT_ID);
        this.isUnmounted = true;
    }

    render() {
        const {entryContent, entryContentCurrentRevId, revisionsItems, renderItemActions} =
            this.props;
        const {status} = this.state;

        if (status === Status.Loading) {
            return (
                <div className={b()}>
                    <div className={b('spin-wrap')}>
                        <Spin className={b('spin')} size="xs" />
                    </div>
                </div>
            );
        }
        if (isEmpty(revisionsItems)) {
            return (
                <div className={b()}>
                    <div className={b('empty')}>{i18n('label_no-changes')}</div>
                </div>
            );
        }

        const handlerItemClick = (data: string) => {
            this.selectRevision({
                revId: data,
                setCurrentRevId: this.props.setEntryCurrentRevId,
                actualRevId: entryContent.publishedId || '',
            });
        };

        return (
            <div className={b()} onScroll={this.onScroll} ref={this.scrollableNodeRef}>
                <ViewAsync status={status} onRetry={this.getRevisions}>
                    <div className={b('content')}>
                        <RevisionsList
                            items={revisionsItems}
                            onItemClick={handlerItemClick}
                            currentRevId={entryContentCurrentRevId}
                            renderItemActions={renderItemActions}
                        />
                        {this.state.loadMore && (
                            <div className={b('loader-wrap')} data-qa="revisions-loader">
                                <Loader size="s" />
                            </div>
                        )}
                    </div>
                </ViewAsync>
            </div>
        );
    }

    private getRevisions = async () => {
        try {
            if (this.state.onceLoading) {
                this.setState({loadMore: true});
            } else {
                this.setState({status: Status.Loading, loadMore: true});
            }
            const searchParams = new URLSearchParams(location.search);

            await this.props.loadRevisions({
                entryId: this.props.entryContent.entryId,
                page: this.state.page,
                revId: searchParams.get(URL_QUERY.REV_ID),
                concurrentId: CONCURRENT_ID,
            });

            if (this.isUnmounted) {
                return;
            }

            this.setState((prevState) => ({
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

    private selectRevision({
        revId,
        setCurrentRevId,
        actualRevId,
    }: {
        revId: string;
        setCurrentRevId: (param: string) => void;
        actualRevId: string;
    }) {
        setCurrentRevId(revId);

        const searchParams = new URLSearchParams(location.search);
        if (revId === actualRevId) {
            searchParams.delete(URL_QUERY.REV_ID);
        } else {
            searchParams.set(URL_QUERY.REV_ID, revId);
        }
        history.push({
            ...location,
            search: `?${searchParams.toString()}`,
        });
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        entryContent: state.entryContent,
        entryContentCurrentRevId: selectEntryContentCurrentRevId(state),
        revisionsItems: selectRevisionsItems(state),
    };
};

const mapDispatchToProps = {
    setEntryCurrentRevId,
    loadRevisions,
    showToast,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Revisions));
