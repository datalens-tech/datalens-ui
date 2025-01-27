import React from 'react';

import block from 'bem-cn-lite';
import {usePrevious} from 'hooks';
import PropTypes from 'prop-types';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {registry} from '../../../../registry';
import {EditorUrlParams, EditorUrls, Status} from '../../constants/common';
import ActionPanel from '../../containers/ActionPanel/ActionPanel';
import Grid from '../../containers/Grid/Grid';
import UnloadConfirmation from '../../containers/UnloadConfirmation/UnloadConfirmation';
import {getFullPathName} from '../../utils';
import EditorPageError from '../EditorPageError/EditorPageError';
import NewChart from '../NewChart/NewChart';
import {ViewLoader} from '../ViewLoader/ViewLoader';

import './EditorPage.scss';

const b = block('editor-page');

const EditorPage = ({
    editorStatus,
    initialLoad,
    match,
    error,
    history,
    location,
    entry,
    asideHeaderData,
    setCurrentPageEntry,
    setLoading,
}) => {
    const [template, setTemplate] = React.useState(null);

    const editorPath = React.useMemo(() => {
        const {extractEntryId} = registry.common.functions.getAll();
        const entryId = extractEntryId(match.params.path);
        return entryId ? entryId : match.params.path;
    }, [match.params.path]);
    const prevEditorPath = usePrevious(editorPath);
    const templatePath = React.useMemo(() => match.params.template, [match.params.template]);
    const {workbookId: routeWorkbookId} = match.params;

    const loadAndSetTemplate = React.useCallback(
        (item) => {
            setTemplate(item);
            initialLoad({template: item, location, workbookId: routeWorkbookId});
        },
        [initialLoad, location, routeWorkbookId],
    );

    const isEntryInited = Boolean(entry) && !entry.fake;
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    const getEditorTemplates = registry.editor.functions.get('getEditorTemplates');

    const templates = getEditorTemplates();

    React.useEffect(() => {
        async function getEntryItem() {
            return templates.find(({name}) => {
                return name === templatePath;
            });
        }

        if (editorPath === EditorUrlParams.New) {
            setTemplate(null);
            return;
        }

        if (editorPath === EditorUrlParams.Draft) {
            setLoading({status: Status.Loading});

            if (templatePath) {
                getEntryItem().then((item) => loadAndSetTemplate(item));
            } else {
                const item = {empty: true};
                loadAndSetTemplate(item);
            }

            return;
        }

        if (editorPath !== prevEditorPath || !isEntryInited) {
            setLoading({status: Status.Loading});
            initialLoad({id: editorPath, location});
        }
    }, [loadAndSetTemplate, editorPath, templatePath, location, initialLoad, setLoading]);

    React.useEffect(() => {
        if (isEntryInited && isAsideHeaderEnabled) {
            setCurrentPageEntry(entry);
        }
    }, [isEntryInited, isAsideHeaderEnabled, entry]);

    React.useEffect(() => {
        return () => {
            if (isAsideHeaderEnabled) {
                setCurrentPageEntry(null);
            }
        };
    }, []);

    function onClickNodeTemplate(item) {
        const urlPath = item.empty ? '' : `/${item.name}`;
        history.push(
            getFullPathName({
                base: `${EditorUrls.EntryDraft}${urlPath}`,
                workbookId: routeWorkbookId,
            }),
        );
    }

    const renderEditor = (size) => {
        switch (editorStatus) {
            case Status.Loading:
                return <ViewLoader size="l" />;
            case Status.Failed:
                return (
                    <EditorPageError
                        retry={() => initialLoad({id: editorPath, template, location})}
                        error={error}
                        entryId={editorPath}
                    />
                );
        }
        return (
            <React.Fragment>
                <UnloadConfirmation />
                <ActionPanel history={history} workbookId={entry.workbookId} />
                <div className={b('content')}>
                    <Grid size={size} />
                </div>
            </React.Fragment>
        );
    };

    const renderPageContent = () => {
        if (editorPath === EditorUrlParams.New) {
            return (
                <NewChart onClickNodeTemplate={onClickNodeTemplate} workbookId={routeWorkbookId} />
            );
        } else {
            return renderEditor(asideHeaderData.size);
        }
    };

    return (
        <React.Fragment>
            <div className={b({aside: isAsideHeaderEnabled})}>
                <DndProvider backend={HTML5Backend}>
                    <main className={b('main')}>{renderPageContent()}</main>
                </DndProvider>
            </div>
        </React.Fragment>
    );
};

EditorPage.propTypes = {
    initialLoad: PropTypes.func.isRequired,
    setCurrentPageEntry: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    editorStatus: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    asideHeaderData: PropTypes.object.isRequired,
    error: PropTypes.object,
    entry: PropTypes.shape({
        key: PropTypes.string,
        entryId: PropTypes.string,
        fake: PropTypes.bool,
        workbookId: PropTypes.string,
    }),
};

export default EditorPage;
