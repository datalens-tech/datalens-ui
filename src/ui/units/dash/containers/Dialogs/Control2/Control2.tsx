import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DatalensGlobalState, Utils} from 'index';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {ControlQA, DashTabItemControlSourceType, Feature} from 'shared';
import {SectionWrapper} from 'ui/components/SectionWrapper/SectionWrapper';
import {AppearanceSection} from 'units/dash/containers/Dialogs/Control2/Sections/AppearanceSection/AppearanceSection';
import {CommonSettingsSection} from 'units/dash/containers/Dialogs/Control2/Sections/CommonSettingsSection/CommonSettingsSection';
import {SelectorPreview} from 'units/dash/containers/Dialogs/Control2/SelectorPreview/SelectorPreview';
import {SelectorTypeSelect} from 'units/dash/containers/Dialogs/Control2/SelectorTypeSelect/SelectorTypeSelect';
import {applyControl2Dialog, closeControl2Dialog} from 'units/dash/store/actions/dashTyped';
import {
    selectIsParametersSectionAvailable,
    selectSelectorDialog,
} from 'units/dash/store/selectors/dashTypedSelectors';

import {ParametersSection} from './Sections/ParametersSection/ParametersSection';

import './Control2.scss';

const controlI18n = I18n.keyset('dash.control-dialog.edit');
const dashI18n = I18n.keyset('dash.main.view');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type OwnProps = {};

type Props = OwnProps & DispatchProps & StateProps;

const b = block('dl-dialog-add-control');

class DialogAddControl extends React.Component<Props> {
    render() {
        const {isEdit, validation} = this.props;
        const textButtonApply = isEdit ? controlI18n('button_save') : controlI18n('button_add');
        //TODO: raname 'label_control' after enabling feature flag
        const caption = Utils.isEnabledFeature(Feature.GroupControls)
            ? dashI18n('button_edit-panel-editor-selector')
            : controlI18n('label_control');

        return (
            <Dialog
                onClose={this.handleClose}
                open={true}
                className={b()}
                size={'m'}
                qa={ControlQA.dialogControl}
                disableFocusTrap={true}
            >
                <Dialog.Header caption={caption} />
                <Dialog.Body className={b('body')}>{this.renderBody()}</Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={this.handleClose}
                    onClickButtonApply={this.handleApply}
                    textButtonApply={textButtonApply}
                    textButtonCancel={controlI18n('button_cancel')}
                    propsButtonApply={{qa: ControlQA.dialogControlApplyBtn}}
                    propsButtonCancel={{qa: ControlQA.dialogControlCancelBtn}}
                >
                    {validation.selectorParameters && (
                        <div className={b('footer-error')}>{validation.selectorParameters}</div>
                    )}
                </Dialog.Footer>
            </Dialog>
        );
    }

    private renderBody() {
        const showTypeSelect = !Utils.isEnabledFeature(Feature.GroupControls);
        const showParametersSection = this.props.isParametersSectionAvailable;

        return (
            <React.Fragment>
                <div className={b('section')}>
                    <SelectorPreview />
                </div>
                {showTypeSelect && (
                    <div className={b('section')}>
                        <SelectorTypeSelect />
                    </div>
                )}
                <div className={b('section')}>
                    <SectionWrapper title={controlI18n('label_common-settings')}>
                        <CommonSettingsSection />
                    </SectionWrapper>
                </div>
                {showParametersSection && (
                    <div className={b('section')}>
                        <ParametersSection />
                    </div>
                )}
                {this.renderAppearanceSection()}
            </React.Fragment>
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
}

const mapStateToProps = (state: DatalensGlobalState) => {
    const {sourceType, validation} = selectSelectorDialog(state);
    return {
        isEdit: Boolean(state.dash.openedItemId),
        sourceType,
        isParametersSectionAvailable: selectIsParametersSectionAvailable(state),
        validation,
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
