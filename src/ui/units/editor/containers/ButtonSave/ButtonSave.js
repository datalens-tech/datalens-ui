import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import ButtonSave from '../../components/ButtonSave/ButtonSave';
import {
    createEditorChart,
    fetchEditorChartUpdate,
    getDefaultPath,
    getEntry,
    getIsScriptsChanged,
} from '../../store/reducers/editor/editor';
import {getButtonSave} from '../../store/selectors';

const mapStateToProps = createStructuredSelector({
    isScriptsChanged: getIsScriptsChanged,
    entry: getEntry,
    componentStoreState: getButtonSave,
    defaultPath: getDefaultPath,
});

const mapDispatchToProps = {
    onCreateEditorChart: createEditorChart,
    onUpdateEditorChart: fetchEditorChartUpdate,
};

export default connect(mapStateToProps, mapDispatchToProps)(ButtonSave);
