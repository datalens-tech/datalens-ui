import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import Editor from '../../components/Editor/Editor';
import {changeEditorCode} from '../../store/actions';
import {getScriptValue} from '../../store/reducers/editor/editor';

const mapStateToProps = createStructuredSelector({
    value: getScriptValue,
});

const mapDispatchToProps = {
    onChangeEditor: changeEditorCode,
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
