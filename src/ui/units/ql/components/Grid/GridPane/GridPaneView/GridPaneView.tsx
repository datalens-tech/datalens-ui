import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {DatalensGlobalState, EntryDialogues} from 'ui';
import {PANE_VIEWS} from 'units/ql/constants';
import {
    getEntry,
    makeGetPaneTabData,
    makeGetPaneTabs,
    makeGetPaneView,
} from 'units/ql/store/reducers/ql';
import type {QLPaneView} from 'units/ql/store/typings/ql';

import GridPaneViewContent from './GridPaneViewContent';

import './GridPaneView.scss';

const b = block('pane-view');

interface PaneViewPassedProps {
    paneId: string;
    paneSize: number;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

type PaneViewMappedProps = ReturnType<typeof makeMapStateToProps>;

type GridPaneViewProps = PaneViewPassedProps & PaneViewMappedProps;

interface GridPaneViewState {
    show: string | null;
    paneId?: string;
    paneView?: QLPaneView;
    module?: string | null;
    isEditorView?: boolean;
}

class GridPaneView extends React.PureComponent<GridPaneViewProps, GridPaneViewState> {
    state: GridPaneViewState = {
        show: null,
    };

    constructor(props: GridPaneViewProps) {
        super(props);

        const {paneView, paneId} = props;
        const isEditorView = paneView.id === PANE_VIEWS.MAIN;

        this.state = {
            paneId,
            paneView,
            show: null,
            module: null,
            isEditorView,
        };
    }

    render() {
        const {paneId, paneView, paneSize, tabData, entryDialoguesRef} = this.props;

        return (
            <div className={b()}>
                <GridPaneViewContent
                    paneSize={paneSize}
                    paneView={paneView}
                    showDiff={false}
                    showSearch={false}
                    paneId={paneId}
                    tabData={tabData}
                    entryDialoguesRef={entryDialoguesRef}
                />
            </div>
        );
    }
}

const makeMapStateToProps = (state: DatalensGlobalState, props: PaneViewPassedProps) => {
    return {
        tabs: makeGetPaneTabs(state, props),
        tabData: makeGetPaneTabData(state, props),
        paneView: makeGetPaneView(state, props),
        entry: getEntry(state),
    };
};

export default connect(makeMapStateToProps, {})(GridPaneView);
