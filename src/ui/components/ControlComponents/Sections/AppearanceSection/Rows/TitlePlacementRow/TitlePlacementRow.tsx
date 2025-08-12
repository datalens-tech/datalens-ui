import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {TitlePlacement} from 'shared';
import {DialogControlQa, TitlePlacements} from 'shared';
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
    {content: i18n('value_title-hidden'), value: TitlePlacements.Hide},
    {content: i18n('value_title-placement-left'), value: TitlePlacements.Left},
    {content: i18n('value_title-placement-top'), value: TitlePlacements.Top},
];

export const TitlePlacementRow = ({className}: {className?: string}) => {
    const dispatch = useDispatch();
    const {elementType, titlePlacement} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const isPlacementDisabled = isFieldDisabled || elementType === ELEMENT_TYPE.CHECKBOX;

    const handleItemPlacementUpdate = React.useCallback(
        (value: TitlePlacement) => {
            dispatch(
                setSelectorDialogItem({
                    titlePlacement: value,
                }),
            );
        },
        [dispatch],
    );

    return (
        <FormRow className={className}>
            <div className={b('setting-container')}>
                <RadioButton
                    qa={DialogControlQa.appearanceTitlePlacement}
                    options={TITLE_PLACEMENT_OPTIONS}
                    value={titlePlacement}
                    disabled={isPlacementDisabled}
                    onUpdate={handleItemPlacementUpdate}
                />
            </div>
        </FormRow>
    );
};
