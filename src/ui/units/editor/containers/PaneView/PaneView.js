import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import PaneView from '../../components/PaneView/PaneView';
import {selectPaneTab, selectPaneView} from '../../store/actions';
import {
    getEntry,
    makeGetPaneTabData,
    makeGetPaneTabs,
    makeGetPaneView,
} from '../../store/reducers/editor/editor';

const makeMapStateToProps = () => {
    const getPaneTabs = makeGetPaneTabs();
    const getPaneTabData = makeGetPaneTabData();
    const getPaneView = makeGetPaneView();
    const mapStateToProps = createStructuredSelector({
        tabs: getPaneTabs,
        tabData: getPaneTabData,
        paneView: getPaneView,
        entry: getEntry,
    });
    return mapStateToProps;
};

const mapDispatchToProps = {
    onSelectTab: selectPaneTab,
    onSelectPaneView: selectPaneView,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(PaneView);
