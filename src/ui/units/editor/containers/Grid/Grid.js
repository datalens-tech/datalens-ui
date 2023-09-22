import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import Grid from '../../components/Grid/Grid';
import {switchPanes} from '../../store/actions';
import {getCurrentSchemeId, getGridPanesIds} from '../../store/reducers/editor/editor';

const mapStateToProps = createStructuredSelector({
    schemeId: getCurrentSchemeId,
    panesIds: getGridPanesIds,
});

const mapDispatchToProps = {
    onSwitchPanes: switchPanes,
};

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
