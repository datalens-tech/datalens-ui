import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import PaneView from '../../containers/PaneView/PaneView';
import DNDPane from '../DNDPane/DNDPane';

import './GridPane.scss';

const b = block('grid-pane');

const GridPane = ({id, onSwitchPanes, paneSize}) => {
    return (
        <div className={b()}>
            <DNDPane onDrop={onSwitchPanes} id={id}>
                {(connectDragSource) => (
                    <PaneView
                        connectDragSource={connectDragSource}
                        paneId={id}
                        paneSize={paneSize}
                    />
                )}
            </DNDPane>
        </div>
    );
};

GridPane.propTypes = {
    id: PropTypes.string.isRequired,
    onSwitchPanes: PropTypes.func.isRequired,
    paneSize: PropTypes.number,
};

export default GridPane;
