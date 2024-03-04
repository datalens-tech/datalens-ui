import React from 'react';

import {FormRow, HelpPopover} from '@gravity-ui/components';
import {Checkbox, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA, DashTabItemControlSourceType, DialogControlQa} from 'shared';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorDialog,
} from 'units/dash/store/selectors/dashTypedSelectors';

import type {SelectorSourceType} from '../../../../../../../store/actions/controls/types';
import {ELEMENT_TYPE} from '../../../../../Control/constants';

import '../../AppearanceSection.scss';

const b = block('control2-appearance-section');

const i18n = I18n.keyset('dash.control-dialog.edit');

const getHelpPopoverText = (sourceType: SelectorSourceType | undefined): string => {
    switch (sourceType) {
        case DashTabItemControlSourceType.Connection:
            // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
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
