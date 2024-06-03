import React, {PureComponent} from 'react';

import block from 'bem-cn-lite';
import type {EntryDialogues} from 'ui';

import PaneView from './GridPaneView/GridPaneView';

import './GridPane.scss';

const b = block('ql-grid-pane');

interface GridPaneProps {
    id: string;
    paneSize: number;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

class GridPane extends PureComponent<GridPaneProps> {
    render() {
        const {id, paneSize, entryDialoguesRef} = this.props;

        return (
            <div className={b()}>
                <PaneView paneId={id} paneSize={paneSize} entryDialoguesRef={entryDialoguesRef} />
            </div>
        );
    }
}

export default GridPane;
