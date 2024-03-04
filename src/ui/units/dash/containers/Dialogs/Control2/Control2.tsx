import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DatalensGlobalState, Utils} from 'index';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {ControlQA, DashTabItemControlSourceType, Feature} from 'shared';
import {AppearanceSection} from 'units/dash/containers/Dialogs/Control2/Sections/AppearanceSection/AppearanceSection';
import {CommonSettingsSection} from 'units/dash/containers/Dialogs/Control2/Sections/CommonSettingsSection/CommonSettingsSection';
import {SelectorPreview} from 'units/dash/containers/Dialogs/Control2/SelectorPreview/SelectorPreview';
import {SelectorTypeSelect} from 'units/dash/containers/Dialogs/Control2/SelectorTypeSelect/SelectorTypeSelect';
import {applyControl2Dialog, closeControl2Dialog} from 'units/dash/store/actions/dashTyped';
import {selectSelectorDialog} from 'units/dash/store/selectors/dashTypedSelectors';

import {ParametersSection} from './Sections/ParametersSection/ParametersSection';

import './Control2.scss';

const i18n = I18n.keyset('dash.control-dialog.edit');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type OwnProps = {};

type Props = OwnProps & DispatchProps & StateProps;

const b = block('dl-dialog-add-control');

class DialogAddControl extends React.Component<Props> {
    render() {
        const {isEdit} = this.props;
        const textButtonApply = isEdit ? i18n('button_save') : i18n('button_add');

        return (
            <Dialog
                onClose={this.handleClose}
                open={true}
                className={b()}
                size={'m'}
                qa={ControlQA.dialogControl}
                disableFocusTrap={true}
            >
                <Dialog.Header caption={i18n('label_control')} />
                <Dialog.Body className={b('body')}>{this.renderBody()}</Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={this.handleClose}
                    onClickButtonApply={this.handleApply}
                    textButtonApply={textButtonApply}
                    textButtonCancel={i18n('button_cancel')}
                    propsButtonApply={{qa: ControlQA.dialogControlApplyBtn}}
                    propsButtonCancel={{qa: ControlQA.dialogControlCancelBtn}}
                />
            </Dialog>
        );
    }

    private renderBody() {
        const {sourceType, isEdit} = this.props;
        const showTypeSelect =
            !isEdit || !Utils.isEnabledFeature(Feature.GroupControls) || sourceType !== 'external';
        const showParametersSection = this.isParametersSectionAvailable();

        return (
            <div>
                <div className={b('section')}>
                    <SelectorPreview />
                </div>
                {showTypeSelect && (
                    <div className={b('section')}>
                        <SelectorTypeSelect />
                    </div>
                )}
                <div className={b('section')}>
                    <CommonSettingsSection />
                </div>
                {showParametersSection && (
                    <div className={b('section')}>
                        <ParametersSection />
                    </div>
                )}
                {this.renderAppearanceSection()}
            </div>
        );
    }

    private renderAppearanceSection() {
        const {sourceType} = this.props;

        if (sourceType === DashTabItemControlSourceType.External) {
            return null;
        }

        return (
            <div className={b('section')}>
                <AppearanceSection />
            </div>
        );
    }

    private handleClose = () => {
        this.props.actions.closeControl2Dialog();
    };

    private handleApply = () => {
        this.props.actions.applyControl2Dialog();
    };

    private isParametersSectionAvailable = () => {
        const {sourceType} = this.props;

        switch (sourceType) {
            case DashTabItemControlSourceType.Connection:
                return true;
            default:
                return false;
        }
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        isEdit: Boolean(state.dash.openedItemId),
        sourceType: selectSelectorDialog(state).sourceType,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                applyControl2Dialog,
                closeControl2Dialog,
            },
            dispatch,
        ),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DialogAddControl);
