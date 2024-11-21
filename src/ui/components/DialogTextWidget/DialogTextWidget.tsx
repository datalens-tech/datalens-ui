import React from 'react';

import {Checkbox, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {DashTabItemText} from 'shared';
import {DialogDashWidgetItemQA, DialogDashWidgetQA} from 'shared';
import {
    CustomPaletteColors,
    PaletteBackground,
} from 'ui/units/dash/containers/Dialogs/components/PaletteBackground/PaletteBackground';

import type {SetItemDataArgs} from '../../units/dash/store/actions/dashTyped';
import {TextEditor} from '../TextEditor/TextEditor';

import './DialogTextWidget.scss';

const b = block('dialog-text');

export interface DialogTextWidgetProps {
    openedItemId: string | null;
    openedItemData: DashTabItemText['data'];
    dialogIsVisible: boolean;

    enableAutoheight?: boolean;

    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
}

interface DialogTextWidgetState {
    text?: string;
    prevVisible?: boolean;
    autoHeight?: boolean;
    backgroundColor?: string;
}

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

    render() {
        const {openedItemId, dialogIsVisible, enableAutoheight} = this.props;
        const {text, autoHeight, backgroundColor} = this.state;

        return (
            <Dialog
                open={dialogIsVisible}
                onClose={this.props.closeDialog}
                disableOutsideClick={true}
                disableFocusTrap={true}
                qa={DialogDashWidgetItemQA.Text}
            >
                <Dialog.Header caption={i18n('dash.text-dialog.edit', 'label_text')} />
                <Dialog.Body className={b()}>
                    <TextEditor autofocus onTextUpdate={this.onTextUpdate} text={text} />
                    {enableAutoheight && (
                        <div className={b('setting-row')}>
                            <Checkbox
                                checked={Boolean(autoHeight)}
                                onChange={this.handleAutoHeightChanged}
                            >
                                {i18n(
                                    'dash.dashkit-plugin-common.view',
                                    'label_autoheight-checkbox',
                                )}
                            </Checkbox>
                        </div>
                    )}
                    <div className={b('setting-row')}>
                        <span className={b('background-label')}>
                            {i18n('dash.dashkit-plugin-common.view', 'label_background-checkbox')}
                        </span>
                        <PaletteBackground
                            color={backgroundColor}
                            onSelect={this.handleHasBackgroundSelected}
                        />
                    </div>
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
                    enabled: backgroundColor !== CustomPaletteColors.NONE,
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
