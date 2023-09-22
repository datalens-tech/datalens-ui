import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import Revisions from '../../components/Revisions/Revisions';
import {
    fetchRevisionChange,
    getEntry,
    getIsScriptsChanged,
    getScriptsValues,
    getTabsData,
} from '../../store/reducers/editor/editor';
import {getDialogRevisionsProgress} from '../../store/selectors';

const mapStateToProps = createStructuredSelector({
    isScriptsChanged: getIsScriptsChanged,
    entry: getEntry,
    tabsData: getTabsData,
    scriptsValues: getScriptsValues,
    progress: getDialogRevisionsProgress,
});

const mapDispatchToProps = {
    onChangeRevision: fetchRevisionChange,
};

export default connect(mapStateToProps, mapDispatchToProps)(Revisions);
