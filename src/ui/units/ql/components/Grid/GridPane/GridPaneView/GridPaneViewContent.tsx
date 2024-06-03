import React from 'react';

import block from 'bem-cn-lite';
import type {EntryDialogues} from 'ui';
import {PANE_VIEWS} from 'units/ql/constants';
import PaneMain from 'units/ql/containers/PaneMain/PaneMain';
import PanePreview from 'units/ql/containers/PanePreview/PanePreview';
import PaneTablePreview from 'units/ql/containers/PaneTablePreview/PaneTablePreview';
import PaneVisualization from 'units/ql/containers/PaneVisualization/PaneVisualization';
import type {QLPaneView, QLTabData} from 'units/ql/store/typings/ql';

const b = block('pane-view');

interface GridPaneViewContentProps {
    paneId: string;
    tabData: QLTabData | null;
    paneView: QLPaneView;
    paneSize: number;
    showDiff: boolean;
    showSearch: boolean;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

class GridPaneViewContent extends React.PureComponent<GridPaneViewContentProps> {
    render() {
        const {paneView, paneSize, entryDialoguesRef} = this.props;

        switch (paneView.id) {
            case PANE_VIEWS.MAIN: {
                return (
                    <div className={b('editor')}>
                        <PaneMain entryDialoguesRef={entryDialoguesRef} paneSize={paneSize} />
                    </div>
                );
            }

            case PANE_VIEWS.SETTINGS: {
                return <PaneVisualization paneSize={paneSize} />;
            }

            case PANE_VIEWS.PREVIEW:
                return <PanePreview paneSize={paneSize} mode="chart" />;

            case PANE_VIEWS.TABLE_PREVIEW:
                return <PaneTablePreview paneSize={paneSize} />;

            default:
                return null;
        }
    }
}

export default GridPaneViewContent;
