import React from 'react';

import block from 'bem-cn-lite';
import {usePrevious} from 'hooks';
import PropTypes from 'prop-types';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {useDispatch} from 'react-redux';
import {isDraftVersion} from 'ui/components/Revisions/helpers';
import {URL_QUERY} from 'ui/constants';
import {openDialogSaveDraftChartAsActualConfirm} from 'ui/store/actions/dialog';
import {getUrlParamFromStr} from 'ui/utils';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {registry} from '../../../../registry';
import {EditorUrlParams, EditorUrls, Status, UPDATE_ENTRY_MODE} from '../../constants/common';
import ActionPanel from '../../containers/ActionPanel/ActionPanel';
import Grid from '../../containers/Grid/Grid';
import UnloadConfirmation from '../../containers/UnloadConfirmation/UnloadConfirmation';
import {fetchEditorChartUpdate} from '../../store/reducers/editor/editor';
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
    setEntryContent,
}) => {
    const [template, setTemplate] = React.useState(null);

    const dispatch = useDispatch();

    const editorPath = React.useMemo(() => {
        const {extractEntryId} = registry.common.functions.getAll();
        const entryId = extractEntryId(match.params.path);
        return entryId ? entryId : match.params.path;
    }, [match.params.path]);
    const prevEditorPath = usePrevious(editorPath);
    const revId = React.useMemo(
        () => getUrlParamFromStr(location.search, URL_QUERY.REV_ID),
        [location.search],
    );
    const prevRevId = usePrevious(revId);
    const templatePath = React.useMemo(() => match.params.template, [match.params.template]);
    const {workbookId} = match.params;

    const loadAndSetTemplate = React.useCallback(
        (item) => {
            setTemplate(item);
            initialLoad({template: item, location});
        },
        [initialLoad, location],
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

        if (revId !== prevRevId || editorPath !== prevEditorPath || !isEntryInited) {
            initialLoad({id: editorPath, location});
        }
    }, [
        loadAndSetTemplate,
        editorPath,
        templatePath,
        location,
        initialLoad,
        setLoading,
        revId,
        isEntryInited,
    ]);

    React.useEffect(() => {
        if (isEntryInited && isAsideHeaderEnabled) {
            setCurrentPageEntry(entry);
            setEntryContent(entry);
        }
    }, [isEntryInited, isAsideHeaderEnabled, entry, setCurrentPageEntry, setEntryContent]);

    React.useEffect(() => {
        return () => {
            if (isAsideHeaderEnabled) {
                setCurrentPageEntry(null);
            }
        };
    }, []);

    function onClickNodeTemplate(item) {
        const urlPath = item.empty ? '' : `/${item.name}`;
        history.push(getFullPathName({base: `${EditorUrls.EntryDraft}${urlPath}`, workbookId}));
    }

    const handleSetActualVersion = () => {
        const isDraftEntry = isDraftVersion(entry);

        if (isDraftEntry) {
            dispatch(fetchEditorChartUpdate({mode: UPDATE_ENTRY_MODE.PUBLISH, history, location}));
        } else {
            dispatch(
                openDialogSaveDraftChartAsActualConfirm({
                    onApply: () =>
                        dispatch(
                            fetchEditorChartUpdate({
                                mode: UPDATE_ENTRY_MODE.PUBLISH,
                                history,
                                location,
                            }),
                        ),
                }),
            );
        }
    };

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
                <ActionPanel
                    history={history}
                    workbookId={workbookId}
                    setActualVersion={handleSetActualVersion}
                />
                <div className={b('content')}>
                    <Grid size={size} />
                </div>
            </React.Fragment>
        );
    };

    const renderPageContent = () => {
        if (editorPath === EditorUrlParams.New) {
            return <NewChart onClickNodeTemplate={onClickNodeTemplate} />;
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
    setEntryContent: PropTypes.func.isRequired,
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
        revId: PropTypes.string,
    }),
};

export default EditorPage;
