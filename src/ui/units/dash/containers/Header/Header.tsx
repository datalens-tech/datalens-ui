import React from 'react';

import type {History, Location} from 'history';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {Feature} from 'shared';
import type {DatalensGlobalState} from 'ui';
import type EntryDialogues from 'ui/components/EntryDialogues/EntryDialogues';
import {MobileTocToggle} from 'ui/components/MobileTocToggle/MobileTocToggle';
import {DL} from 'ui/constants/common';
import {selectCanGoBack, selectCanGoForward} from 'ui/store/selectors/editHistory';
import type {DashEntry} from 'ui/units/dash/typings/entry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {DashActionPanelMobile} from 'units/dash/components/DashActionPanel/DashActionPanelMobile';

import DashActionPanel from '../../components/DashActionPanel/DashActionPanel';
import {toggleTableOfContent} from '../../store/actions/dashTyped';
import {openDialog} from '../../store/actions/dialogs/actions';
import {DASH_EDIT_HISTORY_UNIT_ID} from '../../store/constants';
import {
    canEdit,
    hasTableOfContent,
    isDraft,
    isEditMode,
} from '../../store/selectors/dashTypedSelectors';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type OwnProps = {
    history: History;
    location: Location;
    handlerEditClick: () => void;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    isEditModeLoading?: boolean;
};

type Props = StateProps & DispatchProps & OwnProps;

type State = {};

const isMobileFixedHeaderEnabled = isEnabledFeature(Feature.EnableMobileFixedHeader);

class Header extends React.PureComponent<Props, State> {
    state: State = {};

    render() {
        if (!this.props.entry) {
            return null;
        }

        const showTocHeader =
            this.props.hasTableOfContent && this.props.entry?.data?.settings?.expandTOC;

        if (DL.IS_MOBILE) {
            return isMobileFixedHeaderEnabled ? null : (
                <React.Fragment>
                    <DashActionPanelMobile entry={this.props.entry} />
                    {showTocHeader && <MobileTocToggle onClick={this.props.toggleTableOfContent} />}
                </React.Fragment>
            );
        }

        return (
            <DashActionPanel
                entry={this.props.entry as unknown as DashEntry}
                canEdit={this.props.canEdit}
                isEditMode={this.props.isEditMode}
                isDraft={this.props.isDraft}
                canGoBack={this.props.canGoBack}
                canGoForward={this.props.canGoForward}
                hasTableOfContent={this.props.hasTableOfContent}
                history={this.props.history}
                location={this.props.location}
                progress={Boolean(this.props.isEditModeLoading)}
                openDialog={this.props.openDialog}
                toggleTableOfContent={this.props.toggleTableOfContent}
                handlerEditClick={this.props.handlerEditClick}
                entryDialoguesRef={this.props.entryDialoguesRef}
            />
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    entry: state.dash.entry,
    hasTableOfContent: hasTableOfContent(state),
    canEdit: canEdit(state),
    isEditMode: isEditMode(state),
    isFullscreenMode: state.dash.isFullscreenMode,
    isDraft: isDraft(state),
    canGoBack: selectCanGoBack(state, {unitId: DASH_EDIT_HISTORY_UNIT_ID}),
    canGoForward: selectCanGoForward(state, {unitId: DASH_EDIT_HISTORY_UNIT_ID}),
});

const mapDispatchToProps = {
    openDialog,
    toggleTableOfContent,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
