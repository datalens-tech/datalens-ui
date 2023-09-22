import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import EditorSearch from '../../components/EditorSearch/EditorSearch';
import {getScriptsValues, getTabsData} from '../../store/reducers/editor/editor';

const mapStateToProps = createStructuredSelector({
    scriptsValues: getScriptsValues,
    tabsData: getTabsData,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(EditorSearch);
