import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import PaneEditorDiff from '../../components/PaneEditorDiff/PaneEditorDiff';
import {getScriptOriginalValue, getScriptValue} from '../../store/reducers/editor/editor';

const mapStateToProps = createStructuredSelector({
    value: getScriptValue,
    original: getScriptOriginalValue,
});

export default connect(mapStateToProps, null)(PaneEditorDiff);
