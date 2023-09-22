import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import UnloadConfirmation from '../../components/UnloadConfirmation/UnloadConfirmation';
import {getIsScriptsChanged} from '../../store/reducers/editor/editor';

const mapStateToProps = createStructuredSelector({
    isScriptsChanged: getIsScriptsChanged,
});

export default connect(mapStateToProps, null)(UnloadConfirmation);
