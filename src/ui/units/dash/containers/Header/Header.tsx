import {DL} from 'constants/common';

import React from 'react';

import {History, Location} from 'history';
import {ResolveThunks, connect} from 'react-redux';
import {DatalensGlobalState} from 'ui';
import EntryDialogues from 'ui/components/EntryDialogues/EntryDialogues';
import {MobileTocToggle} from 'ui/components/MobileTocToggle/MobileTocToggle';
import {DashEntry} from 'ui/units/dash/typings/entry';
import {DashActionPanelMobile} from 'units/dash/components/DashActionPanel/DashActionPanelMobile';

import DashActionPanel from '../../components/DashActionPanel/DashActionPanel';
import {openDialog, toggleFullscreenMode} from '../../store/actions/dash';
import {toggleTableOfContent} from '../../store/actions/dashTyped';
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

class Header extends React.PureComponent<Props, State> {
    state: State = {};

    render() {
        if (!this.props.entry) {
            return null;
        }

        const showTocHeader =
            this.props.hasTableOfContent && this.props.entry?.data?.settings?.expandTOC;

        if (DL.IS_MOBILE) {
            return (
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
});

const mapDispatchToProps = {
    openDialog,
    toggleTableOfContent,
    toggleFullscreenMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
