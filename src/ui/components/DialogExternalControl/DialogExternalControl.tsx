import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatalensGlobalState} from 'index';
import {Utils} from 'index';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ControlQA, DashTabItemControlSourceType, Feature} from 'shared';
import {AppearanceSection} from 'ui/components/ControlComponents/Sections/AppearanceSection/AppearanceSection';
import {CommonSettingsSection} from 'ui/components/ControlComponents/Sections/CommonSettingsSection/CommonSettingsSection';
import {ParametersSection} from 'ui/components/ControlComponents/Sections/ParametersSection/ParametersSection';
import {SelectorPreview} from 'ui/components/ControlComponents/SelectorPreview/SelectorPreview';
import {SelectorTypeSelect} from 'ui/components/ControlComponents/SelectorTypeSelect/SelectorTypeSelect';
import {SectionWrapper} from 'ui/components/SectionWrapper/SectionWrapper';
import type {AppDispatch} from 'ui/store';
import {
    applyExternalControlDialog,
    closeExternalControlDialog,
} from 'ui/store/actions/controlDialog';
import {
    selectIsParametersSectionAvailable,
    selectOpenedItemData,
    selectSelectorDialog,
} from 'ui/store/selectors/controlDialog';
import type {SetItemDataArgs} from 'ui/units/dash/store/actions/dashTyped';

import './DialogExternalControl.scss';

const controlI18n = I18n.keyset('dash.control-dialog.edit');
const dashI18n = I18n.keyset('dash.main.view');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export type DialogExternalControlFeaturesProps = {
    enableAutoheightDefault?: boolean;
};

type OwnProps = {
    dialogIsVisible: boolean;
    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
} & DialogExternalControlFeaturesProps;

type Props = OwnProps & DispatchProps & StateProps;

const b = block('dl-dialog-add-control');

class DialogExternalControl extends React.Component<Props> {
    render() {
        const {isEdit, validation, dialogIsVisible} = this.props;
        const textButtonApply = isEdit ? controlI18n('button_save') : controlI18n('button_add');
        //TODO: raname 'label_control' after enabling feature flag
        const caption = dashI18n('button_edit-panel-editor-selector');

        return (
            <Dialog
                onClose={this.handleClose}
                open={dialogIsVisible}
                className={b()}
                size={'m'}
                qa={ControlQA.dialogControl}
                disableFocusTrap={true}
                disableEscapeKeyDown={true}
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
        const {navigationPath, changeNavigationPath, enableAutoheightDefault} = this.props;

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
                        <CommonSettingsSection
                            navigationPath={navigationPath}
                            changeNavigationPath={changeNavigationPath}
                            enableAutoheightDefault={enableAutoheightDefault}
                        />
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
        this.props.actions.closeDialog();
    };

    private handleApply = () => {
        this.props.actions.applyChanges();
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    const {sourceType, validation} = selectSelectorDialog(state);
    const openedItemId = selectOpenedItemData(state);

    return {
        isEdit: Boolean(openedItemId),
        sourceType,
        isParametersSectionAvailable: selectIsParametersSectionAvailable(state),
        validation,
    };
};

const mapDispatchToProps = (dispatch: AppDispatch, props: OwnProps) => {
    return {
        actions: bindActionCreators(
            {
                closeDialog: () =>
                    closeExternalControlDialog({
                        closeDialog: props.closeDialog,
                    }),
                applyChanges: () =>
                    applyExternalControlDialog({
                        closeDialog: props.closeDialog,
                        setItemData: props.setItemData,
                    }),
            },
            dispatch,
        ),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DialogExternalControl);
