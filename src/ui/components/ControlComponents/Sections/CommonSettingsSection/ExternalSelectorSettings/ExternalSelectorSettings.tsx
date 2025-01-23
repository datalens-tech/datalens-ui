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
import {useEffectOnce} from 'ui/hooks';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {selectOpenedItemMeta, selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import {EntryTypeNode} from 'ui/units/dash/modules/constants';

import {EntrySelector} from '../EntrySelector/EntrySelector';

import './ExternalSelectorSettings.scss';

const b = block('external-selector-settings');

const imm = new Context();

type AutoExtendCommand<T = object> = CustomCommands<{$auto: Spec<T>}>;

imm.extend('$auto', (value, object) => {
    return object ? update(object, value) : update({}, value);
});

const ExternalSelectorSettings: React.FC<{
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    enableAutoheightDefault?: boolean;
    rowClassName?: string;
}> = (props) => {
    const dispatch = useDispatch();
    const {autoHeight, chartId, title, selectorParameters, validation, selectorParametersGroup} =
        useSelector(selectSelectorDialog);
    const {workbookId} = useSelector(selectOpenedItemMeta);

    const handleAutoHeightUpdate = React.useCallback(
        (value: boolean) => {
            dispatch(
                setSelectorDialogItem({
                    autoHeight: value,
                }),
            );
        },
        [dispatch],
    );

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

    const handleTitleUpdate = React.useCallback(
        (newTitle: string) => {
            dispatch(
                setSelectorDialogItem({
                    title: newTitle,
                }),
            );
        },
        [dispatch],
    );

    React.useEffect(() => {
        dispatch(setSelectorDialogItem({selectorParametersGroup: 0}));
    }, [dispatch]);

    useEffectOnce(() => {
        if (props.enableAutoheightDefault) {
            handleAutoHeightUpdate(true);
        }
    });

    return (
        <React.Fragment>
            <FormRow
                label={i18n('dash.control-dialog.edit', 'field_title')}
                className={props.rowClassName}
            >
                <FieldWrapper error={validation.title}>
                    <TextInput
                        qa={ControlQA.inputNameControl}
                        value={title}
                        onUpdate={handleTitleUpdate}
                    />
                </FieldWrapper>
            </FormRow>

            <EntrySelector
                className={props.rowClassName}
                label={i18n('dash.control-dialog.edit', 'field_source')}
                entryId={chartId}
                workbookId={workbookId}
                errorText={validation.chartId}
                isInvalid={Boolean(validation.chartId)}
                onChange={handleChartIdChange}
                includeClickableType={EntryTypeNode.CONTROL_NODE}
                navigationPath={props.navigationPath}
                changeNavigationPath={props.changeNavigationPath}
            />

            {!props.enableAutoheightDefault && (
                <FormRow
                    label={i18n('dash.control-dialog.edit', 'field_autoheight')}
                    className={props.rowClassName}
                >
                    <Checkbox
                        className={b('checkbox-option')}
                        checked={autoHeight}
                        onUpdate={handleAutoHeightUpdate}
                        size="l"
                    />
                </FormRow>
            )}
        </React.Fragment>
    );
};

export {ExternalSelectorSettings};
