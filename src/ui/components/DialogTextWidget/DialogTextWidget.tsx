import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {RealTheme} from '@gravity-ui/uikit';
import {Checkbox, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {DashTabItemText} from 'shared';
import {DialogDashWidgetItemQA, DialogDashWidgetQA} from 'shared';
import {CustomPaletteBgColors} from 'shared/constants/widgets';
import {PaletteBackground} from 'ui/units/dash/containers/Dialogs/components/PaletteBackground/PaletteBackground';

import type {SetItemDataArgs} from '../../units/dash/store/actions/dashTyped';
import {TextEditor} from '../TextEditor/TextEditor';

import './DialogTextWidget.scss';

const b = block('dialog-text');

export interface DialogTextWidgetFeatureProps {
    enableAutoheight?: boolean;
    enableCustomBgColorSelector?: boolean;
}

export interface DialogTextWidgetProps extends DialogTextWidgetFeatureProps {
    openedItemId: string | null;
    openedItemData: DashTabItemText['data'];
    dialogIsVisible: boolean;

    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;

    theme?: RealTheme;
}

interface DialogTextWidgetState {
    text?: string;
    prevVisible?: boolean;
    autoHeight?: boolean;
    backgroundColor?: string;
}

const INPUT_TEXT_ID = 'widgetTextField';
const INPUT_AUTOHEIGHT_ID = 'widgetAutoHeightField';

class DialogTextWidget extends React.PureComponent<DialogTextWidgetProps, DialogTextWidgetState> {
    static defaultProps = {
        enableAutoheight: true,
        openedItemData: {
            text: '',
            autoHeight: false,
            backgroundColor: 'transparent',
        },
    };

    static getDerivedStateFromProps(
        nextProps: DialogTextWidgetProps,
        prevState: DialogTextWidgetState,
    ) {
        if (nextProps.dialogIsVisible === prevState.prevVisible) {
            return null;
        }

        return {
            prevVisible: nextProps.dialogIsVisible,
            text: nextProps.openedItemData.text,
            autoHeight: Boolean(nextProps.openedItemData.autoHeight),
            backgroundColor: nextProps.openedItemData.background?.color || '',
        };
    }

    state: DialogTextWidgetState = {};

    private textEditor: React.RefObject<HTMLTextAreaElement> = React.createRef();

    componentDidMount() {
        // delay is needed so that the autofocus of the dialog does not interrupt the focus on the input
        setTimeout(() => {
            this.textEditor.current?.focus();

            const inputValue = this.state.text;
            if (inputValue) {
                this.textEditor.current?.setSelectionRange(inputValue.length, inputValue.length);
            }
        });
    }

    render() {
        const {openedItemId, dialogIsVisible, enableAutoheight, enableCustomBgColorSelector} =
            this.props;
        const {text, autoHeight, backgroundColor} = this.state;

        return (
            <Dialog
                open={dialogIsVisible}
                onClose={this.props.closeDialog}
                disableOutsideClick={true}
                disableFocusTrap={true}
                qa={DialogDashWidgetItemQA.Text}
            >
                <Dialog.Header
                    caption={i18n('dash.dialogs-common.edit', 'title_widget-settings')}
                />
                <Dialog.Body className={b()}>
                    <FormRow
                        className={b('row')}
                        fieldId={INPUT_TEXT_ID}
                        label={i18n('dash.text-dialog.edit', 'label_text')}
                    >
                        <TextEditor
                            id={INPUT_TEXT_ID}
                            onTextUpdate={this.onTextUpdate}
                            text={text}
                            controlRef={this.textEditor}
                        />
                    </FormRow>
                    <FormRow
                        className={b('row')}
                        label={i18n('dash.dashkit-plugin-common.view', 'label_background-checkbox')}
                    >
                        <PaletteBackground
                            color={backgroundColor}
                            onSelect={this.handleHasBackgroundSelected}
                            enableCustomBgColorSelector={enableCustomBgColorSelector}
                        />
                    </FormRow>
                    {enableAutoheight && (
                        <FormRow
                            className={b('row')}
                            fieldId={INPUT_AUTOHEIGHT_ID}
                            label={i18n(
                                'dash.dashkit-plugin-common.view',
                                'label_autoheight-checkbox',
                            )}
                        >
                            <Checkbox
                                id={INPUT_AUTOHEIGHT_ID}
                                className={b('checkbox')}
                                checked={Boolean(autoHeight)}
                                onChange={this.handleAutoHeightChanged}
                            />
                        </FormRow>
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonApply={this.onApply}
                    textButtonApply={
                        openedItemId
                            ? i18n('dash.text-dialog.edit', 'button_save')
                            : i18n('dash.text-dialog.edit', 'button_add')
                    }
                    onClickButtonCancel={this.props.closeDialog}
                    textButtonCancel={i18n('dash.text-dialog.edit', 'button_cancel')}
                    propsButtonApply={{qa: DialogDashWidgetQA.Apply}}
                    propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
                />
            </Dialog>
        );
    }

    onTextUpdate = (text: string) => this.setState({text});

    onApply = () => {
        const {text, autoHeight, backgroundColor} = this.state;

        this.props.setItemData({
            data: {
                text,
                autoHeight,
                background: {
                    enabled: backgroundColor !== CustomPaletteBgColors.NONE,
                    color: backgroundColor,
                },
            },
        });
        this.props.closeDialog();
    };

    handleAutoHeightChanged = () => {
        this.setState({autoHeight: !this.state.autoHeight});
    };

    handleHasBackgroundSelected = (color: string) => {
        this.setState({backgroundColor: color});
    };
}

export default DialogTextWidget;
