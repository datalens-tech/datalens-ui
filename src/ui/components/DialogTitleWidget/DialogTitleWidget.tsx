import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TITLE_DEFAULT_SIZES} from '@gravity-ui/dashkit';
import {ChevronDown, PencilToLine} from '@gravity-ui/icons';
import type {SegmentedRadioGroupOption as RadioButtonOption, RealTheme} from '@gravity-ui/uikit';
import {
    Button,
    Checkbox,
    Dialog,
    Icon,
    SegmentedRadioGroup as RadioButton,
    Select,
    Text,
    TextInput,
} from '@gravity-ui/uikit';
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
import {CustomPaletteBgColors} from 'shared/constants/widgets';
import {PaletteBackground} from 'ui/units/dash/containers/Dialogs/components/PaletteBackground/PaletteBackground';

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
    content: <Icon data={PencilToLine} size={16} />,
};

const presetFontSizeOptions = ['40', '48', '56', '72', '96'].map((opt) => ({
    value: opt,
    content: opt,
}));

function isDashTabItemTitleSize(size: RadioButtonFontSizeOption): size is DashTabItemTitleSize {
    return Object.values(DashTabItemTitleSizes).includes(size as DashTabItemTitleSize);
}

function getNumericFontSize(size: DashTabItemTitleSize) {
    return Number(TITLE_DEFAULT_SIZES[size].fontSize.replace('px', ''));
}

const b = block('dialog-title');

interface DialogTitleWidgetState {
    validation?: {text?: string};
    text?: string;
    fontSize: RadioButtonFontSizeOption;
    customFontSize?: number | null;
    previousSelectedFontSize: number;
    showInTOC?: boolean;
    autoHeight?: boolean;
    backgroundColor?: string;
}

export interface DialogTitleWidgetFeatureProps {
    enableAutoheight?: boolean;
    enableShowInTOC?: boolean;
    enableCustomFontSize?: boolean;
    enableCustomBgColorSelector?: boolean;
}
interface DialogTitleWidgetProps extends DialogTitleWidgetFeatureProps {
    openedItemId: string | null;
    openedItemData: DashTabItemTitle['data'];
    dialogIsVisible: boolean;

    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;

    theme?: RealTheme;
}

const INPUT_TITLE_ID = 'widgetTitleField';
const INPUT_SHOW_IN_TOC_ID = 'widgetShowInTOCField';
const INPUT_AUTOHEIGHT_ID = 'widgetAutoHeightField';

const MIN_FONT_SIZE = 15;
const MAX_FONT_SIZE = 950;

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
        enableCustomBgColorSelector,
        theme,
        closeDialog,
        setItemData,
        openedItemData = defaultOpenedItemData,
    } = props;

    const [state, setState] = React.useState<DialogTitleWidgetState>({
        validation: {},
        text: openedItemData.text,
        ...(typeof openedItemData.size === 'string'
            ? {
                  fontSize: openedItemData.size,
                  customFontSize: null,
                  previousSelectedFontSize: getNumericFontSize(openedItemData.size),
              }
            : {
                  fontSize: 'custom',
                  customFontSize: openedItemData.size.fontSize ?? null,
                  previousSelectedFontSize:
                      openedItemData.size.fontSize ?? getNumericFontSize('xl'),
              }),
        showInTOC: openedItemData.showInTOC,
        autoHeight: Boolean(openedItemData.autoHeight),
        backgroundColor: openedItemData.background?.color || '',
    });
    const {
        text,
        fontSize,
        customFontSize,
        showInTOC,
        validation,
        autoHeight,
        backgroundColor,
        previousSelectedFontSize,
    } = state;

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

    const onSizeChange = React.useCallback((newSize: RadioButtonFontSizeOption) => {
        setState((prevState) => {
            const newNumericSize =
                isDashTabItemTitleSize(newSize) &&
                Object.keys(TITLE_DEFAULT_SIZES).includes(newSize)
                    ? Number(TITLE_DEFAULT_SIZES[newSize].fontSize.replace('px', ''))
                    : undefined;

            return {
                ...prevState,
                fontSize: newSize,
                ...(newSize === 'custom'
                    ? {customFontSize: prevState.previousSelectedFontSize}
                    : {
                          previousSelectedFontSize:
                              newNumericSize ?? prevState.previousSelectedFontSize,
                      }),
                validation: {},
            };
        });
    }, []);

    const onCustomFontSizeChange = React.useCallback(
        (newFontSize: number | null) =>
            setState((prevState) => ({
                ...prevState,
                customFontSize: newFontSize,
                validation: {},
            })),
        [],
    );

    const onCustomFontSizePresetSelectChange = React.useCallback(
        (newFontSize: string[]) =>
            setState((prevState) => ({
                ...prevState,
                customFontSize: newFontSize[0] ? Number(newFontSize[0]) : prevState.customFontSize,
                validation: {},
            })),
        [],
    );

    const onApply = React.useCallback(() => {
        const validationErrors: DialogTitleWidgetState['validation'] = {
            text: text?.trim() ? undefined : i18n('dash.title-dialog.edit', 'toast_required-field'),
        };
        if (Object.values(validationErrors).filter(Boolean).length === 0) {
            const resultedCustomFontSize = customFontSize ?? previousSelectedFontSize;
            setItemData({
                data: {
                    text,
                    size:
                        fontSize === 'custom'
                            ? {
                                  fontSize: Math.min(
                                      MAX_FONT_SIZE,
                                      Math.max(MIN_FONT_SIZE, resultedCustomFontSize),
                                  ),
                              }
                            : fontSize,
                    showInTOC,
                    autoHeight,
                    background: {
                        enabled: backgroundColor !== CustomPaletteBgColors.NONE,
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
        setItemData,
        fontSize,
        customFontSize,
        previousSelectedFontSize,
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

    const inputRef: React.Ref<HTMLInputElement> = React.useRef(null);

    React.useEffect(() => {
        // TODO remove and use "initialFocus={inputRef}" in Dialog props when switch to uikit7
        // delay is needed so that the autofocus of the dialog does not interrupt the focus on the input
        setTimeout(() => {
            inputRef.current?.focus();
        });
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
                            placeholder={i18n('dash.title-dialog.edit', 'context_fill-title')}
                            onUpdate={onTextUpdate}
                            qa={DialogDashTitleQA.Input}
                            controlRef={inputRef}
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
                            <div>
                                <NumberInput
                                    className={b('number-input')}
                                    value={customFontSize}
                                    onUpdate={onCustomFontSizeChange}
                                    onBlur={() => {
                                        if (!customFontSize) {
                                            setState((prevState) => ({
                                                ...prevState,
                                                customFontSize: prevState.previousSelectedFontSize,
                                            }));
                                        }
                                    }}
                                    min={MIN_FONT_SIZE}
                                    max={MAX_FONT_SIZE}
                                    hiddenControls
                                    endContent={
                                        <Select
                                            className={b('unit-select')}
                                            value={[customFontSize]
                                                .filter(Number.isInteger)
                                                .map(String)}
                                            onUpdate={onCustomFontSizePresetSelectChange}
                                            options={presetFontSizeOptions}
                                            popupWidth={80} // equal to NumberInput width
                                            popupPlacement={['bottom-end', 'top-end']}
                                            renderControl={(selectControlProps) => (
                                                <Button
                                                    {...selectControlProps}
                                                    view="flat"
                                                    pin="brick-brick"
                                                >
                                                    <Icon data={ChevronDown} size={16} />
                                                </Button>
                                            )}
                                        />
                                    }
                                />

                                <Text className={b('unit')}>px</Text>
                            </div>
                        )}
                    </div>
                </FormRow>
                <FormRow
                    className={b('row')}
                    label={i18n('dash.dashkit-plugin-common.view', 'label_background-checkbox')}
                >
                    <PaletteBackground
                        color={backgroundColor}
                        theme={theme}
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
