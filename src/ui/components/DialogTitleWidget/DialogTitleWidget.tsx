import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, Dialog, RadioButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {i18n} from 'i18n';
import type {DashTabItemTitle} from 'shared';
import {
    DashTabItemTitleSize,
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

const SIZES = [
    {value: DashTabItemTitleSize.L, content: 'Large'},
    {value: DashTabItemTitleSize.M, content: 'Medium'},
    {value: DashTabItemTitleSize.S, content: 'Small'},
    {value: DashTabItemTitleSize.XS, content: 'XSmall'},
];

const b = block('dialog-title');

interface DialogTitleWidgetState {
    prevVisible?: boolean;
    validation?: {text?: string};
    text?: string;
    size?: DashTabItemTitleSize;
    showInTOC?: boolean;
    autoHeight?: boolean;
    backgroundColor?: string;
}

export interface DialogTitleWidgetFeatureProps {
    enableAutoheight?: boolean;
    enableShowInTOC?: boolean;
}
interface DialogTitleWidgetProps extends DialogTitleWidgetFeatureProps {
    openedItemId: string | null;
    openedItemData: DashTabItemTitle['data'];
    dialogIsVisible: boolean;

    enableAutoheight?: boolean;
    enableShowInTOC?: boolean;

    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
}

const INPUT_TITLE_ID = 'widgetTitleField';
const INPUT_SHOW_IN_TOC_ID = 'widgetShowInTOCField';
const INPUT_AUTOHEIGHT_ID = 'widgetAutoHeightField';

class DialogTitleWidget extends React.PureComponent<
    DialogTitleWidgetProps,
    DialogTitleWidgetState
> {
    static defaultProps = {
        enableAutoheight: true,
        enableShowInTOC: true,
        openedItemData: {
            text: i18n('dash.title-dialog.edit', 'value_default'),
            size: SIZES[0].value,
            showInTOC: true,
            autoHeight: false,
            backgroundColor: 'transparent',
        },
    };

    static getDerivedStateFromProps(
        nextProps: DialogTitleWidgetProps,
        prevState: DialogTitleWidgetState,
    ) {
        if (nextProps.dialogIsVisible === prevState.prevVisible) {
            return null;
        }

        return {
            prevVisible: nextProps.dialogIsVisible,
            validation: {},
            text: nextProps.openedItemData.text,
            size: nextProps.openedItemData.size,
            showInTOC: nextProps.openedItemData.showInTOC,
            autoHeight: Boolean(nextProps.openedItemData.autoHeight),
            backgroundColor: nextProps.openedItemData.background?.color || '',
        };
    }

    state: DialogTitleWidgetState = {};

    render() {
        const {openedItemId, dialogIsVisible, enableAutoheight, enableShowInTOC} = this.props;
        const {text, size, showInTOC, validation, autoHeight, backgroundColor} = this.state;

        return (
            <Dialog
                open={dialogIsVisible}
                onClose={this.props.closeDialog}
                onEnterKeyDown={this.onApply}
                qa={DialogDashWidgetItemQA.Title}
            >
                <Dialog.Header
                    caption={i18n('dash.dialogs-common.edit', 'title_widget-settings')}
                />
                <Dialog.Body className={b()}>
                    <FormRow
                        className={b('row')}
                        fieldId={INPUT_TITLE_ID}
                        label={i18n('dash.title-dialog.edit', 'label_title')}
                    >
                        <FieldWrapper error={validation?.text}>
                            <TextInput
                                id={INPUT_TITLE_ID}
                                size="l"
                                value={text}
                                autoFocus
                                placeholder={i18n('dash.title-dialog.edit', 'context_fill-title')}
                                onUpdate={this.onTextUpdate}
                                qa={DialogDashTitleQA.Input}
                            />
                        </FieldWrapper>
                    </FormRow>
                    <FormRow
                        className={b('row')}
                        label={i18n('dash.title-dialog.edit', 'label_size')}
                    >
                        <RadioButton value={size} options={SIZES} onUpdate={this.onSizeChange} />
                    </FormRow>
                    <FormRow
                        className={b('row')}
                        label={i18n('dash.dashkit-plugin-common.view', 'label_background-checkbox')}
                    >
                        <PaletteBackground
                            color={backgroundColor}
                            onSelect={this.handleHasBackgroundSelected}
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
                                className={b('checkbox')}
                                id={INPUT_AUTOHEIGHT_ID}
                                checked={Boolean(autoHeight)}
                                onChange={this.handleAutoHeightChanged}
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
                                    this.setState((prevState) => ({
                                        showInTOC: !prevState.showInTOC,
                                    }))
                                }
                            />
                        </FormRow>
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonApply={this.onApply}
                    textButtonApply={
                        openedItemId
                            ? i18n('dash.title-dialog.edit', 'button_save')
                            : i18n('dash.title-dialog.edit', 'button_add')
                    }
                    onClickButtonCancel={this.props.closeDialog}
                    textButtonCancel={i18n('dash.title-dialog.edit', 'button_cancel')}
                    propsButtonApply={{qa: DialogDashWidgetQA.Apply}}
                    propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
                />
            </Dialog>
        );
    }

    onTextUpdate = (text: string) =>
        this.setState({
            text,
            validation: {},
        });

    onSizeChange = (size?: string) => this.setState({size: size as DashTabItemTitleSize});

    onApply = () => {
        const {text, size, showInTOC, autoHeight, backgroundColor} = this.state;
        if (text?.trim()) {
            this.props.setItemData({
                data: {
                    text,
                    size,
                    showInTOC,
                    autoHeight,
                    background: {
                        enabled: this.state.backgroundColor !== CustomPaletteColors.NONE,
                        color: backgroundColor,
                    },
                },
            });
            this.props.closeDialog();
        } else {
            this.setState({
                validation: {
                    text: i18n('dash.title-dialog.edit', 'toast_required-field'),
                },
            });
        }
    };

    handleAutoHeightChanged = () => {
        this.setState({autoHeight: !this.state.autoHeight});
    };

    handleHasBackgroundSelected = (color: string) => {
        this.setState({backgroundColor: color});
    };
}

export default DialogTitleWidget;
