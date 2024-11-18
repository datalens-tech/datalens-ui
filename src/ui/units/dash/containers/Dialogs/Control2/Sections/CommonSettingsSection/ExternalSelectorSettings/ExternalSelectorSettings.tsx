import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {i18n} from 'i18n';
import type {CustomCommands, Spec} from 'immutability-helper';
import update, {Context} from 'immutability-helper';
import {useDispatch, useSelector} from 'react-redux';
import type {StringParams} from 'shared';
import {ControlQA} from 'shared';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import {EntryTypeNode} from 'ui/units/dash/modules/constants';

import {EntrySelector} from '../EntrySelector/EntrySelector';

import './ExternalSelectorSettings.scss';

const b = block('external-selector-settings');

const imm = new Context();

type AutoExtendCommand<T = object> = CustomCommands<{$auto: Spec<T>}>;

imm.extend('$auto', (value, object) => {
    return object ? update(object, value) : update({}, value);
});

const ExternalSelectorSettings = () => {
    const dispatch = useDispatch();
    const {autoHeight, chartId, title, selectorParameters, validation, selectorParametersGroup} =
        useSelector(selectSelectorDialog);

    React.useEffect(() => {
        dispatch(setSelectorDialogItem({selectorParametersGroup: 0}));
    }, []);

    const handleAutoHeightUpdate = React.useCallback((value: boolean) => {
        dispatch(
            setSelectorDialogItem({
                autoHeight: value,
            }),
        );
    }, []);

    const handleChartIdChange = React.useCallback(
        (value: {entryId: string; name: string; params?: StringParams}) => {
            const parsedParams = value.params || {};

            const {selectorParameters: mergedSelectorParameters} = imm.update<
                {selectorParameters: StringParams},
                AutoExtendCommand<StringParams>
            >(
                {selectorParameters: selectorParameters || {}},
                {selectorParameters: {$auto: {$merge: parsedParams}}},
            );

            dispatch(
                setSelectorDialogItem({
                    chartId: value.entryId,
                    title: title || value.name,
                    selectorParameters: mergedSelectorParameters,
                }),
            );
            dispatch(
                setSelectorDialogItem({
                    selectorParametersGroup: (selectorParametersGroup ?? 0) + 1,
                }),
            );
        },
        [selectorParameters, dispatch, title, selectorParametersGroup],
    );

    const handleTitleUpdate = React.useCallback((newTitle: string) => {
        dispatch(
            setSelectorDialogItem({
                title: newTitle,
            }),
        );
    }, []);

    return (
        <React.Fragment>
            <FormRow label={i18n('dash.control-dialog.edit', 'field_title')}>
                <FieldWrapper error={validation.title}>
                    <TextInput
                        qa={ControlQA.inputNameControl}
                        value={title}
                        onUpdate={handleTitleUpdate}
                    />
                </FieldWrapper>
            </FormRow>

            <EntrySelector
                label={i18n('dash.control-dialog.edit', 'field_source')}
                entryId={chartId}
                onChange={handleChartIdChange}
                includeClickableType={EntryTypeNode.CONTROL_NODE}
            />

            <FormRow label={i18n('dash.control-dialog.edit', 'field_autoheight')}>
                <Checkbox
                    className={b('checkbox-option')}
                    checked={autoHeight}
                    onUpdate={handleAutoHeightUpdate}
                    size="l"
                />
            </FormRow>
        </React.Fragment>
    );
};

export {ExternalSelectorSettings};
