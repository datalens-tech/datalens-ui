import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import ActionPanelService from '../../components/ActionPanel/ActionPanel';
import {drawPreview, selectGridScheme} from '../../store/actions';
import {
    getCurrentSchemeId,
    getEntry,
    getIsScriptsChanged,
    getScriptsValues,
    getTabsData,
} from '../../store/reducers/editor/editor';
import {getIsGridContainsPreview} from '../../store/selectors';

const mapStateToProps = createStructuredSelector({
    isScriptsChanged: getIsScriptsChanged,
    entry: getEntry,
    tabsData: getTabsData,
    scriptsValues: getScriptsValues,
    schemeId: getCurrentSchemeId,
    isGridContainsPreview: getIsGridContainsPreview,
});

const mapDispatchToProps = {
    onDrawPreview: drawPreview,
    onSelectGridScheme: selectGridScheme,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanelService);
