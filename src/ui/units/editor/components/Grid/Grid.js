import React from 'react';

import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import SplitPane from 'react-split-pane';
import {SPLIT_PANE_RESIZER_CLASSNAME} from 'ui';

import {getGridSchemes} from '../../configs/grid/grid-schemes';
import GridPane from '../GridPane/GridPane';

const paneStyleDragging = {overflow: 'hidden'};
const splitPaneStyle = {
    overflow: 'visible',
};
const gridScheme = getGridSchemes();

function renderGridScheme({
    scheme,
    ids,
    paneSize,
    onChange,
    onSwitchPanes,
    dragging,
    setDragging,
    schemeId,
}) {
    return scheme.map((child, i) => {
        const {name, childNodes, props: splitPaneProps, index} = child;
        return name === 'child' ? (
            <GridPane
                id={ids[index]}
                key={`${schemeId}_${i}`}
                paneSize={paneSize}
                onSwitchPanes={onSwitchPanes}
            />
        ) : (
            <SplitPane
                resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                {...splitPaneProps}
                key={`${schemeId}_${i}`}
                onChange={onChange}
                style={splitPaneStyle}
                paneStyle={dragging ? paneStyleDragging : undefined}
                onDragStarted={() => setDragging(true)}
                onDragFinished={() => setDragging(false)}
            >
                {Boolean(childNodes) &&
                    renderGridScheme({
                        scheme: childNodes,
                        ids,
                        paneSize,
                        onChange,
                        onSwitchPanes,
                        dragging,
                        setDragging,
                        schemeId,
                    })}
            </SplitPane>
        );
    });
}

function Grid({schemeId, panesIds, onSwitchPanes, size}) {
    const [paneSize, onChangePaneSize] = React.useState(0);
    const [dragging, setDragging] = React.useState(false);
    const onChange = React.useMemo(() => debounce(onChangePaneSize, 16), [onChangePaneSize]); // for reflow ChartKit, MonacoEditor
    React.useEffect(() => {
        const onResize = () => onChange(window.innerHeight + window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [onChange]);
    React.useEffect(() => {
        onChange(size);
    }, [onChange, size]);

    React.useEffect(() => {
        return () => {
            onChange.cancel();
        };
    }, []);
    const {scheme} = gridScheme.schemes[schemeId];
    return renderGridScheme({
        scheme,
        ids: panesIds,
        paneSize,
        onChange,
        onSwitchPanes,
        dragging,
        setDragging,
        schemeId,
    });
}

Grid.propTypes = {
    schemeId: PropTypes.string.isRequired,
    panesIds: PropTypes.array.isRequired,
    onSwitchPanes: PropTypes.func.isRequired,
    size: PropTypes.number,
};

export default Grid;
