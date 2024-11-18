import React from 'react';

import {FormRow, HelpPopover} from '@gravity-ui/components';
import {Checkbox, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA, DashTabItemControlSourceType, DialogControlQa} from 'shared';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorDialog,
} from 'ui/store/selectors/controlDialog';
import type {SelectorSourceType} from 'ui/store/typings/controlDialog';

import {ELEMENT_TYPE} from '../../../../../../units/dash/containers/Dialogs/Control/constants';

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

export const InnerTitleRow = () => {
    const dispatch = useDispatch();
    const {elementType, showInnerTitle, innerTitle, sourceType} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const isInnerTitleDisabled = elementType === ELEMENT_TYPE.CHECKBOX || isFieldDisabled;
    const isInnerTitleActive = (elementType !== ELEMENT_TYPE.CHECKBOX && showInnerTitle) ?? false;

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
            <HelpPopover
                htmlContent={getHelpPopoverText(sourceType)}
                placement={['bottom', 'top']}
                offset={{top: -1, left: 5}}
            />
        </React.Fragment>
    );

    return (
        <FormRow label={label}>
            <div
                className={b('operation-container')}
                data-qa={DialogControlQa.appearanceInnerTitle}
            >
                <Checkbox
                    className={b('operation-checkbox')}
                    disabled={isInnerTitleDisabled}
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
