import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {RealTheme} from '@gravity-ui/uikit';
import {Checkbox, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {DashTabItemText} from 'shared';
import {CustomPaletteBgColors, DialogDashWidgetItemQA, DialogDashWidgetQA} from 'shared';
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

const DEFAULT_OPENED_ITEM_DATA: DashTabItemText['data'] = {
    text: '',
    autoHeight: false,
    background: {color: CustomPaletteBgColors.NONE},
};

function DialogTextWidget(props: DialogTextWidgetProps) {
    const {
        enableAutoheight = true,
        enableCustomBgColorSelector,
        openedItemData = DEFAULT_OPENED_ITEM_DATA,
        dialogIsVisible,
        closeDialog,
        setItemData,
        openedItemId,
    } = props;

    const [state, setState] = React.useState<DialogTextWidgetState>({
        text: openedItemData.text,
        autoHeight: Boolean(openedItemData.autoHeight),
        backgroundColor: openedItemData.background?.color,
    });
    const [prevDialogIsVisible, setPrevDialogIsVisible] = React.useState<boolean | undefined>();

    React.useEffect(() => {
        if (dialogIsVisible === prevDialogIsVisible) {
            return;
        }

        setPrevDialogIsVisible(dialogIsVisible);
        setState((prevState) => ({
            ...prevState,
            text: openedItemData.text,
            autoHeight: Boolean(openedItemData.autoHeight),
            backgroundColor: openedItemData.background?.color,
        }));
    }, [openedItemData, dialogIsVisible, prevDialogIsVisible]);

    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const textEditorRef = React.useCallback(
        (textEditor: HTMLTextAreaElement) => {
            /**
             * TODO try to remove and use "initialFocus={inputRef}" in Dialog props when switch to uikit7
             * Don't forget test caret position
             */
            // delay is needed so that the autofocus of the dialog does not interrupt the focus on the input
            if (textEditor) {
                timeoutRef.current = setTimeout(() => {
                    textEditor.focus();

                    const inputValueLength = textEditor.textLength ?? 0;
                    if (inputValueLength > 0) {
                        textEditor.setSelectionRange(inputValueLength, inputValueLength);
                    }
                }, 0);
            }
        },
        [timeoutRef],
    );

    const onTextUpdate = React.useCallback((text: string) => {
        setState((prevState) => ({...prevState, text}));
    }, []);

    const onApply = React.useCallback(() => {
        const {text, autoHeight, backgroundColor} = state;

        setItemData({
            data: {
                text,
                autoHeight,
                background: {
                    color: backgroundColor,
                },
            },
        });
        closeDialog();
    }, [state, setItemData, closeDialog]);

    const handleAutoHeightChanged = React.useCallback(() => {
        setState((prevState) => ({...prevState, autoHeight: !prevState.autoHeight}));
    }, []);

    const handleHasBackgroundSelected = React.useCallback((color: string) => {
        setState((prevState) => ({...prevState, backgroundColor: color}));
    }, []);

    const {text, autoHeight, backgroundColor} = state;

    return (
        <Dialog
            open={dialogIsVisible}
            onClose={closeDialog}
            disableOutsideClick={true}
            qa={DialogDashWidgetItemQA.Text}
        >
            <Dialog.Header caption={i18n('dash.dialogs-common.edit', 'title_widget-settings')} />
            <Dialog.Body className={b()}>
                <FormRow
                    className={b('row')}
                    fieldId={INPUT_TEXT_ID}
                    label={i18n('dash.text-dialog.edit', 'label_text')}
                >
                    <TextEditor
                        id={INPUT_TEXT_ID}
                        onTextUpdate={onTextUpdate}
                        text={text}
                        controlRef={textEditorRef}
                    />
                </FormRow>
                <FormRow
                    className={b('row')}
                    label={i18n('dash.dashkit-plugin-common.view', 'label_background-checkbox')}
                >
                    <PaletteBackground
                        color={backgroundColor}
                        onSelect={handleHasBackgroundSelected}
                        enableCustomBgColorSelector={enableCustomBgColorSelector}
                    />
                </FormRow>
                {enableAutoheight && (
                    <FormRow
                        className={b('row')}
                        fieldId={INPUT_AUTOHEIGHT_ID}
                        label={i18n('dash.dashkit-plugin-common.view', 'label_autoheight-checkbox')}
                    >
                        <Checkbox
                            id={INPUT_AUTOHEIGHT_ID}
                            className={b('checkbox')}
                            checked={Boolean(autoHeight)}
                            onChange={handleAutoHeightChanged}
                        />
                    </FormRow>
                )}
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={onApply}
                textButtonApply={
                    openedItemId
                        ? i18n('dash.text-dialog.edit', 'button_save')
                        : i18n('dash.text-dialog.edit', 'button_add')
                }
                onClickButtonCancel={closeDialog}
                textButtonCancel={i18n('dash.text-dialog.edit', 'button_cancel')}
                propsButtonApply={{qa: DialogDashWidgetQA.Apply}}
                propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
            />
        </Dialog>
    );
}

export default DialogTextWidget;
