import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {TitlePlacementOption} from 'shared/types/dash';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {ELEMENT_TYPE} from 'ui/store/constants/controlDialog';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorDialog,
} from 'ui/store/selectors/controlDialog';

import '../../AppearanceSection.scss';

const b = block('control2-appearance-section');

const i18n = I18n.keyset('dash.group-controls-dialog.edit');

const TITLE_PLACEMENT_OPTIONS = [
    {content: i18n('value_title-placement-left'), value: TitlePlacementOption.Left},
    {content: i18n('value_title-placement-top'), value: TitlePlacementOption.Top},
];

export const TitlePlacementRow = () => {
    const dispatch = useDispatch();
    const {elementType, titlePlacement = TitlePlacementOption.Left} =
        useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const isPlacementDisabled = isFieldDisabled || elementType === ELEMENT_TYPE.CHECKBOX;

    const handleItemPlacementUpdate = React.useCallback(
        (value: string) => {
            dispatch(
                setSelectorDialogItem({
                    titlePlacement: value as TitlePlacementOption,
                }),
            );
        },
        [dispatch],
    );

    return (
        <FormRow label={i18n('label_title-placement')}>
            <div className={b('operation-container')}>
                <RadioButton
                    options={TITLE_PLACEMENT_OPTIONS}
                    value={titlePlacement}
                    disabled={isPlacementDisabled}
                    onUpdate={handleItemPlacementUpdate}
                />
            </div>
        </FormRow>
    );
};
