import React from 'react';

import {FormRow, HelpPopover} from '@gravity-ui/components';
import type {RealTheme} from '@gravity-ui/uikit';
import {Checkbox, Dialog, Flex, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import {DialogDashWidgetItemQA, DialogDashWidgetQA} from 'shared';
import type {DashTabItemImage, EntryScope, RecursivePartial} from 'shared';
import {registry} from 'ui/registry';

import {PaletteBackground} from '../..//units/dash/containers/Dialogs/components/PaletteBackground/PaletteBackground';
import type {SetItemDataArgs} from '../../units/dash/store/actions/dashTyped';

import './DialogImageWidget.scss';

const b = block('dialog-image');
const INPUT_SRC_ID = 'dialog-image-input-src';
const INPUT_ALT_ID = 'dialog-image-input-alt';
const INPUT_PRESERVE_ASPECT_RATIO_ID = 'dialog-image-input-preserve-aspect-ratio';
const DEFAULT_ITEM_DATA: DashTabItemImage['data'] = {
    src: '',
    alt: '',
    background: {
        color: 'transparent',
    },
    preserveAspectRatio: true,
};

export type DialogImageWidgetFeatureProps = {};

type Props = {
    openedItemId: string | null;
    openedItemData?: DashTabItemImage['data'];
    dialogIsVisible: boolean;
    onClose: () => void;
    onApply: (newItemData: SetItemDataArgs) => void;
    scope: EntryScope;
    theme?: RealTheme;
} & DialogImageWidgetFeatureProps;

const getValidationErrors = (data: DashTabItemImage['data']) => {
    const result: Record<string, string> = {};

    if (!data.src) {
        result[INPUT_SRC_ID] = i18n('dash.image-dialog.edit', 'label_required-field');
    }

    return result;
};

export function DialogImageWidget(props: Props) {
    const {
        dialogIsVisible,
        openedItemId,
        openedItemData = DEFAULT_ITEM_DATA,
        onClose,
        onApply,
        scope,
    } = props;
    const [data, setData] = React.useState(openedItemData);
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
    const {DialogImageWidgetLinkHint} = registry.common.components.getAll();
    const updateData = (updates: RecursivePartial<DashTabItemImage['data']>) => {
        const resultData = merge(cloneDeep(data), updates);
        setData(resultData);
    };

    const handleSrcUpdate = (nextSrc: string) => {
        setValidationErrors({
            ...validationErrors,
            [INPUT_SRC_ID]: '',
        });
        updateData({src: nextSrc});
    };

    const handleApply = () => {
        const nextValidationErrors = getValidationErrors(data);

        if (Object.keys(nextValidationErrors).length) {
            setValidationErrors(nextValidationErrors);
            return;
        }

        onApply({data});
        onClose();
    };

    return (
        <Dialog
            open={dialogIsVisible}
            onClose={onClose}
            onEnterKeyDown={handleApply}
            qa={DialogDashWidgetItemQA.Image}
        >
            <Dialog.Header caption={i18n('dash.image-dialog.edit', 'label_title')} />
            <Dialog.Body className={b()}>
                <FormRow
                    className={b('row')}
                    fieldId={INPUT_SRC_ID}
                    label={
                        <Flex gap={1}>
                            {i18n('dash.image-dialog.edit', 'label_link')}
                            <DialogImageWidgetLinkHint scope={scope} />
                        </Flex>
                    }
                >
                    <TextInput
                        id={INPUT_SRC_ID}
                        value={data.src}
                        onUpdate={handleSrcUpdate}
                        controlProps={{required: true}}
                        validationState={validationErrors[INPUT_SRC_ID] ? 'invalid' : undefined}
                        errorMessage={validationErrors[INPUT_SRC_ID] || ''}
                        autoFocus={true}
                    />
                </FormRow>
                <FormRow
                    className={b('row')}
                    fieldId={INPUT_ALT_ID}
                    label={
                        <Flex gap={1}>
                            {i18n('dash.image-dialog.edit', 'label_alt-text')}
                            <HelpPopover
                                content={i18n(
                                    'dash.image-dialog.edit',
                                    'label_alt-text-description',
                                )}
                            />
                        </Flex>
                    }
                >
                    <TextInput
                        id={INPUT_ALT_ID}
                        value={data.alt}
                        onUpdate={(alt) => updateData({alt})}
                    />
                </FormRow>
                <FormRow
                    className={b('row')}
                    fieldId={INPUT_PRESERVE_ASPECT_RATIO_ID}
                    label={i18n('dash.image-dialog.edit', 'label_aspect-ratio')}
                >
                    <Checkbox
                        id={INPUT_PRESERVE_ASPECT_RATIO_ID}
                        checked={data.preserveAspectRatio}
                        onUpdate={(preserveAspectRatio) => updateData({preserveAspectRatio})}
                    />
                </FormRow>
                <FormRow
                    className={b('row')}
                    label={i18n('dash.dashkit-plugin-common.view', 'label_background-checkbox')}
                >
                    <PaletteBackground
                        color={data.background?.color}
                        onSelect={(color) => updateData({background: {color}})}
                        enableCustomBgColorSelector
                    />
                </FormRow>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={handleApply}
                textButtonApply={
                    openedItemId
                        ? i18n('dash.image-dialog.edit', 'button_save')
                        : i18n('dash.image-dialog.edit', 'button_add')
                }
                onClickButtonCancel={onClose}
                textButtonCancel={i18n('dash.image-dialog.edit', 'button_cancel')}
                propsButtonApply={{
                    qa: DialogDashWidgetQA.Apply,
                }}
                propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
            />
        </Dialog>
    );
}
