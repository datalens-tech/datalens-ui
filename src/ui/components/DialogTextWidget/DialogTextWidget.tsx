import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {RealTheme} from '@gravity-ui/uikit';
import {Checkbox, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n, i18n} from 'i18n';
import type {DashTabItemText} from 'shared';
import {CustomPaletteBgColors, DialogDashWidgetItemQA, DialogDashWidgetQA, Feature} from 'shared';
import {PaletteBackground} from 'ui/units/dash/containers/Dialogs/components/PaletteBackground/PaletteBackground';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {SetItemDataArgs} from '../../units/dash/store/actions/dashTyped';
import {useBackgroundColorSettings} from '../DialogTitleWidget/useColorSettings';
import {WidgetRoundingsInput} from '../WidgetRoundingsInput/WidgetRoundingsInput';
import type {WysiwygEditorRef} from '../WysiwygEditor/WysiwygEditor';
import {WysiwygEditor} from '../WysiwygEditor/WysiwygEditor';

import './DialogTextWidget.scss';

const i18nCommon = I18n.keyset('dash.dashkit-plugin-common.view');
const b = block('dialog-text');

export interface DialogTextWidgetFeatureProps {
    enableAutoheight?: boolean;
    enableCustomBgColorSelector?: boolean;
    enableSeparateThemeColorSelector?: boolean;
    enableBorderRadiusSelector?: boolean;
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
    borderRadius?: number;
    isError?: boolean;
}

const INPUT_TEXT_ID = 'widgetTextField';
const INPUT_AUTOHEIGHT_ID = 'widgetAutoHeightField';

const isDashColorPickersByThemeEnabled = isEnabledFeature(Feature.EnableDashColorPickersByTheme);

const DEFAULT_OPENED_ITEM_DATA: DashTabItemText['data'] = {
    text: '',
    autoHeight: false,
    ...(isDashColorPickersByThemeEnabled
        ? {
              backgroundSettings: {
                  color: undefined,
              },
          }
        : {
              background: {
                  color: CustomPaletteBgColors.NONE,
              },
          }),
};

function DialogTextWidget(props: DialogTextWidgetProps) {
    const {
        enableAutoheight = true,
        enableCustomBgColorSelector = false,
        enableSeparateThemeColorSelector = true,
        enableBorderRadiusSelector = false,
        openedItemData = DEFAULT_OPENED_ITEM_DATA,
        dialogIsVisible,
        closeDialog,
        setItemData,
        openedItemId,
    } = props;

    const isNewWidget = !props.openedItemData;

    const [state, setState] = React.useState<DialogTextWidgetState>({
        text: openedItemData.text,
        autoHeight: Boolean(openedItemData.autoHeight),
        borderRadius: openedItemData.borderRadius,
    });

    const {
        oldBackgroundColor,
        backgroundColorSettings,
        setOldBackgroundColor,
        setBackgroundColorSettings,
        resultedBackgroundSettings,
        updateStateByProps,
    } = useBackgroundColorSettings({
        background: openedItemData.background,
        backgroundSettings: openedItemData.backgroundSettings,
        defaultOldColor: CustomPaletteBgColors.NONE,
        enableSeparateThemeColorSelector,
        isNewWidget,
    });

    const [prevDialogIsVisible, setPrevDialogIsVisible] = React.useState<boolean | undefined>();

    React.useEffect(() => {
        if (dialogIsVisible === prevDialogIsVisible) {
            return;
        }

        setPrevDialogIsVisible(dialogIsVisible);
        updateStateByProps({
            background: openedItemData.background,
            backgroundSettings: openedItemData.backgroundSettings,
            defaultOldColor: CustomPaletteBgColors.NONE,
            enableSeparateThemeColorSelector,
            isNewWidget,
        });
        setState((prevState) => ({
            ...prevState,
            text: openedItemData.text,
            autoHeight: Boolean(openedItemData.autoHeight),
        }));
    }, [
        openedItemData,
        dialogIsVisible,
        prevDialogIsVisible,
        enableSeparateThemeColorSelector,
        updateStateByProps,
        isNewWidget,
    ]);

    const editorRef = React.useRef<WysiwygEditorRef>(null);

    const onMarkupChange = React.useCallback((editor: WysiwygEditorRef) => {
        setState((prevState) => ({...prevState, text: editor.getValue()}));
    }, []);

    const onError = React.useCallback(() => {
        setState((prevState) => ({...prevState, isError: true}));
    }, []);

    const onApply = React.useCallback(() => {
        const {text, autoHeight, borderRadius} = state;

        setItemData({
            data: {
                text,
                autoHeight,
                borderRadius,
                ...resultedBackgroundSettings,
            },
        });
        closeDialog();
    }, [state, setItemData, closeDialog, resultedBackgroundSettings]);

    const handleAutoHeightChanged = React.useCallback(() => {
        setState((prevState) => ({...prevState, autoHeight: !prevState.autoHeight}));
    }, []);

    const setBorderRadius = React.useCallback((value: number | undefined) => {
        setState((prevState) => ({...prevState, borderRadius: value}));
    }, []);

    const {text, autoHeight, borderRadius, isError} = state;

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
                    <WysiwygEditor
                        ref={editorRef}
                        autofocus
                        className={b('wysiwyg-editor')}
                        initial={{
                            markup: text,
                        }}
                        onMarkupChange={onMarkupChange}
                        onError={onError}
                        enableExtensions={true}
                    />
                </FormRow>
                <FormRow className={b('row')} label={i18nCommon('label_background-checkbox')}>
                    <PaletteBackground
                        oldColor={oldBackgroundColor}
                        onSelectOldColor={setOldBackgroundColor}
                        color={backgroundColorSettings}
                        onSelect={setBackgroundColorSettings}
                        enableCustomBgColorSelector={enableCustomBgColorSelector}
                        enableSeparateThemeColorSelector={enableSeparateThemeColorSelector}
                    />
                </FormRow>
                {enableBorderRadiusSelector && isEnabledFeature(Feature.EnableNewDashSettings) && (
                    <FormRow className={b('row')} label={i18nCommon('label_border-radius')}>
                        <WidgetRoundingsInput value={borderRadius} onUpdate={setBorderRadius} />
                    </FormRow>
                )}
                {enableAutoheight && (
                    <FormRow
                        className={b('row')}
                        fieldId={INPUT_AUTOHEIGHT_ID}
                        label={i18nCommon('label_autoheight-checkbox')}
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
                propsButtonApply={{disabled: isError, qa: DialogDashWidgetQA.Apply}}
                propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
            />
        </Dialog>
    );
}

export default DialogTextWidget;
