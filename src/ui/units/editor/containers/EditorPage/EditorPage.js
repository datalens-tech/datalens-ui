import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import {selectAsideHeaderData} from 'store/selectors/asideHeader';
import {setEntryContent} from 'ui/store/actions/entryContent';

import EditorPage from '../../components/EditorPage/EditorPage';
import {
    fetchInitialLoad,
    getEditorPageError,
    getEditorStatus,
    getEntry,
    initialLoading,
} from '../../store/reducers/editor/editor';

const mapStateToProps = createStructuredSelector({
    entry: getEntry,
    editorStatus: getEditorStatus,
    error: getEditorPageError,
    asideHeaderData: selectAsideHeaderData,
});

const mapDispatchToProps = {
    initialLoad: fetchInitialLoad,
    setLoading: initialLoading,
    setCurrentPageEntry,
    setEntryContent,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditorPage);
