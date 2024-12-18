import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {ValueOf} from 'shared';
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

const TitlePlacements = {
    Hide: 'hide',
    Left: TitlePlacementOption.Left,
    Top: TitlePlacementOption.Top,
};

type TitlePlacement = ValueOf<typeof TitlePlacements>;

const TITLE_PLACEMENT_OPTIONS = [
    {content: i18n('value_title-hidden'), value: TitlePlacements.Hide},
    {content: i18n('value_title-placement-left'), value: TitlePlacements.Left},
    {content: i18n('value_title-placement-top'), value: TitlePlacements.Top},
];

export const TitlePlacementRow = ({className}: {className?: string}) => {
    const {titlePlacement, handleItemPlacementUpdate} = useTitlePlacement();
    const {elementType} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const isPlacementDisabled = isFieldDisabled || elementType === ELEMENT_TYPE.CHECKBOX;

    return (
        <FormRow className={className}>
            <div className={b('setting-container')}>
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

function useTitlePlacement() {
    const dispatch = useDispatch();
    const {titlePlacement: externalTitlePlacement, showTitle} = useSelector(selectSelectorDialog);

    const titlePlacement: TitlePlacement =
        showTitle && externalTitlePlacement ? externalTitlePlacement : TitlePlacements.Hide;

    const handleItemPlacementUpdate = React.useCallback(
        (value: TitlePlacement) => {
            if (value === TitlePlacements.Hide) {
                dispatch(
                    setSelectorDialogItem({
                        showTitle: false,
                        titlePlacement: undefined,
                    }),
                );
            } else {
                dispatch(
                    setSelectorDialogItem({
                        showTitle: true,
                        titlePlacement: value as TitlePlacementOption,
                    }),
                );
            }
        },
        [dispatch],
    );

    return {
        titlePlacement,
        handleItemPlacementUpdate,
    };
}
