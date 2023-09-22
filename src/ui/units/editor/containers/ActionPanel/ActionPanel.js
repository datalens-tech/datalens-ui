import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import ActionPanelService from '../../components/ActionPanel/ActionPanel';
import {drawPreview, selectGridScheme} from '../../store/actions';
import {getCurrentSchemeId, getEntry} from '../../store/reducers/editor/editor';
import {getIsGridContainsPreview} from '../../store/selectors';

const mapStateToProps = createStructuredSelector({
    entry: getEntry,
    schemeId: getCurrentSchemeId,
    isGridContainsPreview: getIsGridContainsPreview,
});

const mapDispatchToProps = {
    onDrawPreview: drawPreview,
    onSelectGridScheme: selectGridScheme,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanelService);
