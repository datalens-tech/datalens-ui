import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {i18n} from 'i18n';
import update, {Context, CustomCommands, Spec} from 'immutability-helper';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA, StringParams} from 'shared';
import NavigationInput from 'units/dash/components/NavigationInput/NavigationInput';
import {ENTRY_TYPE} from 'units/dash/modules/constants';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {selectSelectorDialog} from 'units/dash/store/selectors/dashTypedSelectors';

import './ExternalSelectorSettings.scss';

const b = block('external-selector-settings');

const imm = new Context();

type AutoExtendCommand<T = object> = CustomCommands<{$auto: Spec<T>}>;

imm.extend('$auto', (value, object) => {
    return object ? update(object, value) : update({}, value);
});

const ExternalSelectorSettings = () => {
    const dispatch = useDispatch();
    const {autoHeight, chartId, title, defaults, validation} = useSelector(selectSelectorDialog);
    const [externalChangedId, setExternalChangedId] = React.useState(0);

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

            const {defaults: mergedDefaults} = imm.update<
                {defaults: StringParams},
                AutoExtendCommand<StringParams>
            >({defaults}, {defaults: {$auto: {$merge: parsedParams}}});

            dispatch(
                setSelectorDialogItem({
                    chartId: value.entryId,
                    title: title || value.name,
                    defaults: mergedDefaults,
                }),
            );
            setExternalChangedId(externalChangedId + 1);
        },
        [title, defaults, externalChangedId],
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

            <FormRow label={i18n('dash.control-dialog.edit', 'field_source')}>
                <div className={b('navigation-container')}>
                    <NavigationInput
                        entryId={chartId}
                        onChange={handleChartIdChange}
                        includeClickableType={ENTRY_TYPE.CONTROL_NODE}
                        linkMixin={b('link')}
                        navigationMixin={b('navigation')}
                    />
                </div>
            </FormRow>

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
