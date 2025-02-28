import React, {useCallback} from 'react';

import block from 'bem-cn-lite';
import {usePrevious} from 'hooks/usePrevious';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import SplitPane from 'react-split-pane';
import {EditorPaneQA} from 'shared';
import {SPLIT_PANE_RESIZER_CLASSNAME, useSetState} from 'ui';

import Editor from '../../containers/Editor/Editor';
import EditorSearch from '../../containers/EditorSearch/EditorSearch';

import './PaneEditor.scss';

const b = block('pane-editor');
const paneStyleDragging = {overflow: 'hidden'};
const splitPaneStyle = {
    overflow: 'visible',
};

function PaneEditor({
    className,
    paneId,
    id,
    language,
    onModuleClick,
    showSearch,
    onSelectTab,
    paneSize,
}) {
    const [state, setState] = useSetState({
        isDragging: false,
        highlightRange: null,
    });

    const [splitSize, onChangeSplitSize] = React.useState(0);
    const onChange = React.useMemo(() => debounce(onChangeSplitSize, 20), [onChangeSplitSize]);

    const prevShowSearch = usePrevious(showSearch);

    if (state.highlightRange !== null && !showSearch && prevShowSearch) {
        setState({highlightRange: null});
    }

    const onOpenFound = useCallback(
        ({id: tabId, range}) => {
            onSelectTab({paneId, tabId});
            setState({
                highlightRange: {
                    range,
                    id: tabId,
                },
            });
        },
        [paneId],
    );

    const onClear = useCallback(() => {
        setState({highlightRange: null});
    }, []);

    return (
        <div className={b(false, className)} data-qa={EditorPaneQA.Editor}>
            {showSearch ? (
                <SplitPane
                    resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                    split="vertical"
                    minSize={100}
                    maxSize={-100}
                    defaultSize="33%"
                    style={splitPaneStyle}
                    onChange={onChange}
                    paneStyle={state.isDragging ? paneStyleDragging : undefined}
                    onDragStarted={() => setState({isDragging: true})}
                    onDragFinished={() => setState({isDragging: false})}
                >
                    <div className={b('pane-children')}>
                        <EditorSearch
                            className={b('editor-search')}
                            paneId={paneId}
                            onOpenFound={onOpenFound}
                            onClear={onClear}
                        />
                    </div>
                    <div className={b('pane-children')}>
                        <div className={b('editor-place')}>
                            <Editor
                                id={id}
                                language={language}
                                onModuleClick={onModuleClick}
                                highlightRange={state.highlightRange}
                                size={paneSize + splitSize}
                            />
                        </div>
                    </div>
                </SplitPane>
            ) : (
                <div className={b('editor-place')}>
                    <Editor
                        id={id}
                        language={language}
                        onModuleClick={onModuleClick}
                        size={paneSize}
                    />
                </div>
            )}
        </div>
    );
}

PaneEditor.propTypes = {
    className: PropTypes.string,
    paneId: PropTypes.string,
    id: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    onModuleClick: PropTypes.func.isRequired,
    showSearch: PropTypes.bool,
    onSelectTab: PropTypes.func,
    paneSize: PropTypes.number,
};

export default PaneEditor;
