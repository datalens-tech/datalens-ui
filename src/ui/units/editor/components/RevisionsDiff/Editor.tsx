import React from 'react';

import {i18n} from 'i18n';
import get from 'lodash/get';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {showToast} from 'store/actions/toaster';
import {ViewAsync} from 'ui/components/ViewAsync/ViewAsync';

import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {Status} from '../../constants/common';
import type {EditorEntry, EditorEntryDataApi} from '../../types/common';
import type {ScriptsValues, TabData} from '../../types/store';

import {EditorDiffRevisions} from './EditorDiffRevisions/EditorDiffRevisions';
import {CURRENT, b} from './constants';

type Side = 'left' | 'right';

type EditorProps = {
    entry: EditorEntry;
    tabsData: TabData[];
    scriptsValues: ScriptsValues;
    revIdLeft?: string;
    revIdRight?: string;
    currentTabId: string;
    renderSideBySide: boolean;
};

type RevisionsDiffState = {
    status: Status;
    leftScripts: EditorEntryDataApi;
    rightScripts: EditorEntryDataApi;
};

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = EditorProps & DispatchProps;

type SetStateDynamicKey = Pick<RevisionsDiffState, keyof RevisionsDiffState>;

class Editor extends React.Component<Props, RevisionsDiffState> {
    state: RevisionsDiffState = {
        status: Status.Loading,
        leftScripts: {},
        rightScripts: this.props.scriptsValues,
    };

    private isUnmounted = false;

    componentDidMount() {
        this.fetchInitialData();
    }

    componentDidUpdate(prevProps: EditorProps): void {
        if (!this.props.revIdLeft && !this.props.revIdRight) return;

        if (this.props.revIdLeft && prevProps.revIdLeft !== this.props.revIdLeft) {
            this.getScripts('left', this.props.revIdLeft);
        }

        if (this.props.revIdRight && prevProps.revIdRight !== this.props.revIdRight) {
            this.getScripts('right', this.props.revIdRight);
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {leftScripts, rightScripts} = this.state;

        return (
            <ViewAsync status={this.state.status} classNameLoader={b('script-loader')}>
                <EditorDiffRevisions
                    language={this.getLanguage()}
                    original={this.getCodeText(leftScripts)}
                    value={this.getCodeText(rightScripts)}
                    renderSideBySide={this.props.renderSideBySide}
                />
            </ViewAsync>
        );
    }

    private async getScripts(side: Side, selectValue: string) {
        const targetScriptsKey = side === 'left' ? 'leftScripts' : 'rightScripts';
        if (selectValue === CURRENT) {
            this.setState({
                [targetScriptsKey]: this.props.scriptsValues,
            } as Pick<RevisionsDiffState, typeof targetScriptsKey>);
            return;
        }
        const anotherSelectValue = side === 'left' ? this.props.revIdRight : this.props.revIdLeft;
        if (selectValue === anotherSelectValue) {
            const anotherScripts =
                side === 'left' ? this.state.rightScripts : this.state.leftScripts;
            this.setState({
                [targetScriptsKey]: anotherScripts,
            } as unknown as SetStateDynamicKey);
            return;
        }
        try {
            this.setState({status: Status.Loading});
            const entry = await this.getEntry(selectValue);
            const data = entry.data as EditorEntryDataApi;
            if (this.isUnmounted) {
                return;
            }
            this.setState({
                [targetScriptsKey]: data,
                loadScripts: false,
                status: Status.Success,
            } as unknown as SetStateDynamicKey);
        } catch (error) {
            if (this.isUnmounted || getSdk().sdk.isCancel(error)) {
                return;
            }
            logger.logError('RevisionsDiff: getScripts failed', error);
            this.props.showToast({
                title: i18n('component.dialog-revisions-diff.view', 'toast_get-script-failed'),
                name: 'getScriptsFailed',
                error,
                withReport: true,
            });
            this.setState({status: Status.Failed});
        }
    }

    private getCodeText(values: EditorEntryDataApi): string {
        const {currentTabId} = this.props;
        return get(values, [currentTabId], '') || '';
    }

    private getLanguage() {
        const {currentTabId} = this.props;
        const {tabsData} = this.props;
        const tab = tabsData.find(({id}) => id === currentTabId);
        return tab?.language || 'javascript';
    }

    private fetchInitialData = async () => {
        try {
            if (!this.props.revIdLeft) return;

            this.setState({status: Status.Loading});
            const {data} = await this.getEntry(this.props.revIdLeft);

            if (this.isUnmounted) {
                return;
            }

            this.setState({
                status: Status.Success,
                leftScripts: data || {},
                rightScripts: this.props.scriptsValues,
            });
        } catch (error) {
            logger.logError('RevisionsDiff: fetchInitialData failed', error);
            if (this.isUnmounted) {
                return;
            }
            this.props.showToast({
                title: i18n(
                    'component.dialog-revisions-diff.view',
                    'toast_fetch-initial-diff-failed',
                ),
                name: 'fetchInitialDataFailed',
                error,
                withReport: true,
            });
            this.setState({status: Status.Failed});
        }
    };

    private getEntry(revId: string) {
        return getSdk().sdk.us.getEntry(
            {entryId: this.props.entry.entryId, revId},
            {concurrentId: 'getEntry: RevisionsDiff'},
        );
    }
}

const mapDispatchToProps = {
    showToast,
};

export default connect(null, mapDispatchToProps)(Editor);
