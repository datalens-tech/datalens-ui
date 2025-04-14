import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {MODULE_TYPE, PANE_VIEWS} from '../../constants/common';
import Console from '../../containers/Console/Console';
import PaneEditorDiff from '../../containers/PaneEditorDiff/PaneEditorDiff';
import Preview from '../../containers/Preview/Preview';
import {ButtonDiff} from '../ButtonDiff/ButtonDiff';
import {ButtonDocs} from '../ButtonDocs/ButtonDocs';
import {ButtonEditorSearch} from '../ButtonEditorSearch/ButtonEditorSearch';
import Documentation from '../Documentation/Documentation';
import DragItem from '../DragItem/DragItem';
import PaneEditor from '../PaneEditor/PaneEditor';
import PaneTabs from '../PaneTabs/PaneTabs';
import {PaneViewSelect} from '../PaneViewSelect/PaneViewSelect';

import {ACTION_TYPE, SHOW, usePaneViewState} from './usePaneViewState';

import './PaneView.scss';

const b = block('pane-view');

export const ICON_PANE_DEFAULT_SIZE = 16;

const PaneViewContent = ({
    paneId,
    paneSize,
    tabData,
    paneView,
    showDiff,
    showSearch,
    onModuleClick,
    onSelectTab,
}) => {
    switch (paneView.id) {
        case PANE_VIEWS.EDITOR: {
            const {id, language} = tabData;
            return (
                <div className={b('editor')}>
                    {showDiff ? (
                        <PaneEditorDiff id={id} language={language} paneSize={paneSize} />
                    ) : (
                        <PaneEditor
                            id={id}
                            language={language}
                            onModuleClick={onModuleClick}
                            paneId={paneId}
                            showSearch={showSearch}
                            onSelectTab={onSelectTab}
                            paneSize={paneSize}
                        />
                    )}
                </div>
            );
        }
        case PANE_VIEWS.PREVIEW:
            return <Preview paneSize={paneSize} />;
        case PANE_VIEWS.CONSOLE:
            return <Console />;
        default:
            return null;
    }
};

PaneViewContent.propTypes = {
    paneId: PropTypes.string.isRequired,
    tabData: PropTypes.object,
    paneView: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }),
    paneSize: PropTypes.number,
    showDiff: PropTypes.bool,
    showSearch: PropTypes.bool,
    onModuleClick: PropTypes.func,
    onSelectTab: PropTypes.func,
};

const PaneView = ({
    connectDragSource,
    paneId,
    tabs,
    tabData,
    onSelectTab,
    onSelectPaneView,
    paneView,
    paneSize,
    entry,
}) => {
    const {state, setState, dispatchAction} = usePaneViewState({paneId, tabData, paneView});

    const hasDocs = Boolean(tabData) && Array.isArray(tabData.docs);
    const hideContent = hasDocs && state.show === SHOW.DOCS;

    function onModuleClick(module) {
        setState({
            show: SHOW.DOCS,
            module,
        });
    }

    return (
        <div className={b()}>
            <div className={b('control-panel')}>
                {entry.type !== MODULE_TYPE && (
                    <PaneViewSelect
                        value={paneView.id}
                        onChange={(view) => onSelectPaneView({paneId, view})}
                    />
                )}
                {Array.isArray(tabs) && Boolean(tabs.length) && (
                    <PaneTabs
                        paneId={paneId}
                        tabs={tabs}
                        currentTabId={tabData.id}
                        onSelectTab={onSelectTab}
                    />
                )}
                <div className={b('panel-right-section')}>
                    {state.isEditorView && (
                        <ButtonEditorSearch
                            className={b('btn-search')}
                            onClick={() =>
                                dispatchAction(ACTION_TYPE.TOGGLE_SHOW, {show: SHOW.SEARCH})
                            }
                            active={state.show === SHOW.SEARCH}
                        />
                    )}
                    {state.isEditorView && (
                        <ButtonDiff
                            className={b('btn-diff')}
                            onClick={() =>
                                dispatchAction(ACTION_TYPE.TOGGLE_SHOW, {show: SHOW.DIFF})
                            }
                            active={state.show === SHOW.DIFF}
                        />
                    )}
                    {hasDocs && isEnabledFeature(Feature.EnableChartEditorDocs) && (
                        <ButtonDocs
                            onClick={() =>
                                dispatchAction(ACTION_TYPE.TOGGLE_SHOW, {show: SHOW.DOCS})
                            }
                            active={state.show === SHOW.DOCS}
                        />
                    )}
                    {connectDragSource(
                        <div className={b('drag-item')}>
                            <DragItem />
                        </div>,
                    )}
                </div>
            </div>
            <div className={b('content', {hide: hideContent})}>
                <PaneViewContent
                    paneSize={paneSize}
                    tabData={tabData}
                    paneView={paneView}
                    showDiff={state.show === SHOW.DIFF}
                    showSearch={state.show === SHOW.SEARCH}
                    onModuleClick={onModuleClick}
                    paneId={paneId}
                    onSelectTab={onSelectTab}
                />
            </div>
            {hideContent && <Documentation docs={tabData.docs} module={state.module} />}
        </div>
    );
};

PaneView.propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    paneId: PropTypes.string.isRequired,
    tabs: PropTypes.array.isRequired,
    tabData: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        language: PropTypes.string.isRequired,
        docs: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    }),
    onSelectTab: PropTypes.func.isRequired,
    onSelectPaneView: PropTypes.func.isRequired,
    paneView: PropTypes.object,
    paneSize: PropTypes.number,
    entry: PropTypes.shape({
        type: PropTypes.string,
    }),
};

export default PaneView;
