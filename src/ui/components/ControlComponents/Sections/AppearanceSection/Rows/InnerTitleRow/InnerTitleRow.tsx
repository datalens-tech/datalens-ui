import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, HelpMark, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA, DashTabItemControlSourceType, DialogControlQa} from 'shared';
import {YfmWrapper} from 'ui/components/YfmWrapper/YfmWrapper';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorDialog,
} from 'ui/store/selectors/controlDialog';
import type {SelectorSourceType} from 'ui/store/typings/controlDialog';

import '../../AppearanceSection.scss';

const b = block('control2-appearance-section');

const i18n = I18n.keyset('dash.control-dialog.edit');

const getHelpPopoverText = (sourceType: SelectorSourceType | undefined): string => {
    switch (sourceType) {
        case DashTabItemControlSourceType.Connection:
            return i18n('field_inner-title-note-connection-selector');
        default:
            return i18n('field_inner-title-note');
    }
};

export const InnerTitleRow = ({className}: {className?: string}) => {
    const dispatch = useDispatch();
    const {showInnerTitle, innerTitle, sourceType} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const isInnerTitleActive = showInnerTitle ?? false;

    const handleShowInnerTitleUpdate = React.useCallback((showInnerTitle: boolean) => {
        dispatch(
            setSelectorDialogItem({
                showInnerTitle,
            }),
        );
    }, []);

    const handleInnerTitleUpdate = React.useCallback((innerTitle: string) => {
        dispatch(
            setSelectorDialogItem({
                innerTitle,
            }),
        );
    }, []);

    const label = (
        <React.Fragment>
            <span>{i18n('field_inner-title')}</span>
            <HelpMark
                popoverProps={{
                    placement: ['bottom', 'top'],
                }}
            >
                <YfmWrapper content={getHelpPopoverText(sourceType)} setByInnerHtml={true} />
            </HelpMark>
        </React.Fragment>
    );

    return (
        <FormRow label={label} className={className}>
            <div className={b('setting-container')} data-qa={DialogControlQa.appearanceInnerTitle}>
                <Checkbox
                    className={b('setting-checkbox')}
                    disabled={isFieldDisabled}
                    checked={isInnerTitleActive}
                    qa={ControlQA.showInnerTitleCheckbox}
                    onUpdate={handleShowInnerTitleUpdate}
                    size="l"
                />
                <TextInput
                    disabled={!isInnerTitleActive || isFieldDisabled}
                    value={innerTitle || ''}
                    qa={ControlQA.inputInnerLabelControl}
                    onUpdate={handleInnerTitleUpdate}
                />
            </div>
        </FormRow>
    );
};
