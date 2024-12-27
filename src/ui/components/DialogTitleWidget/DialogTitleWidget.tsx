import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {RadioButtonOption} from '@gravity-ui/uikit';
import {Checkbox, Dialog, RadioButton, Text, TextInput} from '@gravity-ui/uikit';
import {unstable_NumberInput as NumberInput} from '@gravity-ui/uikit/unstable';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {i18n} from 'i18n';
import type {DashTabItemTitle, DashTabItemTitleSize} from 'shared';
import {
    DashTabItemTitleSizes,
    DialogDashTitleQA,
    DialogDashWidgetItemQA,
    DialogDashWidgetQA,
} from 'shared';
import {
    CustomPaletteColors,
    PaletteBackground,
} from 'ui/units/dash/containers/Dialogs/components/PaletteBackground/PaletteBackground';

import type {SetItemDataArgs} from '../../units/dash/store/actions/dashTyped';

import './DialogTitleWidget.scss';

type RadioButtonFontSizeOption = DashTabItemTitleSize | 'custom';

const FONT_SIZE_OPTIONS: RadioButtonOption<DashTabItemTitleSize>[] = [
    {value: DashTabItemTitleSizes.XS, content: 'XS'},
    {value: DashTabItemTitleSizes.S, content: 'S'},
    {value: DashTabItemTitleSizes.M, content: 'M'},
    {value: DashTabItemTitleSizes.L, content: 'L'},
    {value: DashTabItemTitleSizes.XL, content: 'XL'},
];

const CUSTOM_FONT_SIZE_OPTION: RadioButtonOption<RadioButtonFontSizeOption> = {
    value: 'custom',
    content: 'Custom',
};

const b = block('dialog-title');

interface DialogTitleWidgetState {
    validation?: {text?: string; customFontSize?: string; customLineHeight?: string};
    text?: string;
    fontSize: RadioButtonFontSizeOption;
    customFontSize?: number | null;
    showInTOC?: boolean;
    autoHeight?: boolean;
    backgroundColor?: string;
}

export interface DialogTitleWidgetFeatureProps {
    enableAutoheight?: boolean;
    enableShowInTOC?: boolean;
    enableCustomFontSize?: boolean;
}
interface DialogTitleWidgetProps extends DialogTitleWidgetFeatureProps {
    openedItemId: string | null;
    openedItemData: DashTabItemTitle['data'];
    dialogIsVisible: boolean;

    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
}

const INPUT_TITLE_ID = 'widgetTitleField';
const INPUT_SHOW_IN_TOC_ID = 'widgetShowInTOCField';
const INPUT_AUTOHEIGHT_ID = 'widgetAutoHeightField';

const defaultOpenedItemData: DashTabItemTitle['data'] = {
    text: i18n('dash.title-dialog.edit', 'value_default'),
    size: FONT_SIZE_OPTIONS[0].value,
    showInTOC: true,
    autoHeight: false,
    background: {color: 'transparent'},
};

function DialogTitleWidget(props: DialogTitleWidgetProps) {
    const {
        openedItemId,
        dialogIsVisible,
        enableAutoheight = true,
        enableShowInTOC = true,
        closeDialog,
        setItemData,
        openedItemData = defaultOpenedItemData,
    } = props;

    const [state, setState] = React.useState<DialogTitleWidgetState>({
        validation: {},
        text: openedItemData.text,
        ...(typeof openedItemData.size === 'string'
            ? {fontSize: openedItemData.size, customFontSize: null}
            : {
                  fontSize: 'custom',
                  customFontSize: openedItemData.size.fontSize ?? null,
              }),
        showInTOC: openedItemData.showInTOC,
        autoHeight: Boolean(openedItemData.autoHeight),
        backgroundColor: openedItemData.background?.color || '',
    });
    const {text, fontSize, customFontSize, showInTOC, validation, autoHeight, backgroundColor} =
        state;

    const enableCustomFontSize =
        props.enableCustomFontSize || typeof openedItemData?.size === 'object';

    const fontSizeOptions = React.useMemo<RadioButtonOption<RadioButtonFontSizeOption>[]>(
        () =>
            enableCustomFontSize
                ? [...FONT_SIZE_OPTIONS, CUSTOM_FONT_SIZE_OPTION]
                : FONT_SIZE_OPTIONS,
        [enableCustomFontSize],
    );

    const onTextUpdate = React.useCallback(
        (newText: string) =>
            setState((prevState) => ({...prevState, text: newText, validation: {}})),
        [],
    );

    const onSizeChange = React.useCallback(
        (newSize: RadioButtonFontSizeOption) =>
            setState((prevState) => ({...prevState, fontSize: newSize, validation: {}})),
        [],
    );

    const onCustomFontSizeChange = React.useCallback(
        (newFontSize: number | null) =>
            setState((prevState) => ({
                ...prevState,
                customFontSize: newFontSize ?? undefined,
                validation: {},
            })),
        [],
    );

    const onApply = React.useCallback(() => {
        const validationErrors = {
            text: text?.trim() ? undefined : i18n('dash.title-dialog.edit', 'toast_required-field'),
            customFontSize:
                fontSize === 'custom' && !customFontSize
                    ? i18n('dash.title-dialog.edit', 'toast_required-field')
                    : undefined,
        };
        if (Object.values(validationErrors).filter(Boolean).length === 0) {
            setItemData({
                data: {
                    text,
                    size: fontSize === 'custom' ? {fontSize: customFontSize} : fontSize,
                    showInTOC,
                    autoHeight,
                    background: {
                        enabled: backgroundColor !== CustomPaletteColors.NONE,
                        color: backgroundColor,
                    },
                },
            });
            closeDialog();
        } else {
            setState((prevState) => ({
                ...prevState,
                validation: validationErrors,
            }));
        }
    }, [
        text,
        fontSize,
        customFontSize,
        setItemData,
        showInTOC,
        autoHeight,
        backgroundColor,
        closeDialog,
    ]);

    const handleAutoHeightChanged = React.useCallback(() => {
        setState((prevState) => ({...prevState, autoHeight: !prevState.autoHeight}));
    }, []);

    const handleHasBackgroundSelected = React.useCallback((color: string) => {
        setState((prevState) => ({...prevState, backgroundColor: color}));
    }, []);

    return (
        <Dialog
            open={dialogIsVisible}
            onClose={closeDialog}
            onEnterKeyDown={onApply}
            qa={DialogDashWidgetItemQA.Title}
        >
            <Dialog.Header caption={i18n('dash.dialogs-common.edit', 'title_widget-settings')} />
            <Dialog.Body className={b()}>
                <FormRow
                    className={b('row')}
                    fieldId={INPUT_TITLE_ID}
                    label={i18n('dash.title-dialog.edit', 'label_title')}
                >
                    <FieldWrapper error={validation?.text}>
                        <TextInput
                            id={INPUT_TITLE_ID}
                            value={text}
                            autoFocus
                            placeholder={i18n('dash.title-dialog.edit', 'context_fill-title')}
                            onUpdate={onTextUpdate}
                            qa={DialogDashTitleQA.Input}
                        />
                    </FieldWrapper>
                </FormRow>
                <FormRow className={b('row')} label={i18n('dash.title-dialog.edit', 'label_size')}>
                    <div className={b('controls-wrapper')}>
                        <RadioButton
                            className={b('radiobtn')}
                            value={fontSize}
                            options={fontSizeOptions}
                            onUpdate={onSizeChange}
                        />
                        {enableCustomFontSize && fontSize === 'custom' && (
                            <React.Fragment>
                                <NumberInput
                                    className={b('number-input')}
                                    value={customFontSize}
                                    onUpdate={onCustomFontSizeChange}
                                    min={1}
                                    max={200}
                                    hiddenControls
                                    validationState={
                                        validation?.customFontSize ? 'invalid' : undefined
                                    }
                                    errorMessage={validation?.customFontSize}
                                    errorPlacement="inside"
                                />
                                <Text className={b('unit')}>px</Text>
                            </React.Fragment>
                        )}
                    </div>
                </FormRow>
                <FormRow
                    className={b('row')}
                    label={i18n('dash.dashkit-plugin-common.view', 'label_background-checkbox')}
                >
                    <PaletteBackground
                        color={backgroundColor}
                        onSelect={handleHasBackgroundSelected}
                    />
                </FormRow>
                {enableAutoheight && (
                    <FormRow
                        className={b('row')}
                        fieldId={INPUT_AUTOHEIGHT_ID}
                        label={i18n('dash.dashkit-plugin-common.view', 'label_autoheight-checkbox')}
                    >
                        <Checkbox
                            className={b('checkbox')}
                            id={INPUT_AUTOHEIGHT_ID}
                            checked={Boolean(autoHeight)}
                            onChange={handleAutoHeightChanged}
                        />
                    </FormRow>
                )}
                {enableShowInTOC && (
                    <FormRow
                        className={b('row')}
                        fieldId={INPUT_SHOW_IN_TOC_ID}
                        label={i18n('dash.title-dialog.edit', 'field_show-in-toc')}
                    >
                        <Checkbox
                            className={b('checkbox')}
                            id={INPUT_SHOW_IN_TOC_ID}
                            checked={showInTOC}
                            onChange={() =>
                                setState((prevState) => ({
                                    ...prevState,
                                    showInTOC: !prevState.showInTOC,
                                }))
                            }
                        />
                    </FormRow>
                )}
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={onApply}
                textButtonApply={
                    openedItemId
                        ? i18n('dash.title-dialog.edit', 'button_save')
                        : i18n('dash.title-dialog.edit', 'button_add')
                }
                onClickButtonCancel={closeDialog}
                textButtonCancel={i18n('dash.title-dialog.edit', 'button_cancel')}
                propsButtonApply={{qa: DialogDashWidgetQA.Apply}}
                propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
            />
        </Dialog>
    );
}

export default DialogTitleWidget;
