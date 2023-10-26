import {DL} from 'constants/common';

import React from 'react';

import {History, Location} from 'history';
import {ResolveThunks, connect} from 'react-redux';
import {DatalensGlobalState} from 'ui';
import EntryDialogues from 'ui/components/EntryDialogues/EntryDialogues';
import {DashEntry} from 'ui/units/dash/typings/entry';
import {DashActionPanelMobile} from 'units/dash/components/DashActionPanel/DashActionPanelMobile';

import DashActionPanel from '../../components/DashActionPanel/DashActionPanel';
import {openDialog, toggleFullscreenMode} from '../../store/actions/dash';
import {toggleTableOfContent} from '../../store/actions/dashTyped';
import {canEdit, hasTableOfContent, isDraft, isEditMode} from '../../store/selectors/dash';
import {selectSettings} from '../../store/selectors/dashTypedSelectors';

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

    toggleFullscreenModeMobile = () => {
        this.props.toggleFullscreenMode({
            location: this.props.location,
            history: this.props.history,
        });
    };

    render() {
        if (!this.props.entry) {
            return null;
        }

        if (DL.IS_MOBILE) {
            return (
                <DashActionPanelMobile
                    entry={this.props.entry}
                    isFullscreenMode={Boolean(this.props.isFullscreenMode)}
                    toggleFullscreenMode={this.toggleFullscreenModeMobile}
                />
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
    settings: selectSettings(state),
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
