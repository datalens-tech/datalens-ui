import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import Console from '../../components/Console/Console';
import {getLogsData} from '../../store/reducers/editor/editor';

const mapStateToProps = createStructuredSelector({
    logsData: getLogsData,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Console);
