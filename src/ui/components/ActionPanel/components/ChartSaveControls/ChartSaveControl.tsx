import React from 'react';

import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useSelector} from 'react-redux';
import type {EntryUpdateMode} from 'shared';
import {DL} from 'ui/constants/common';
import {selectIsRenameWithoutReload} from 'ui/store/selectors/entryContent';

import NavigationPrompt from '../../../NavigationPrompt/NavigationPrompt';

import {SaveButton} from './components/SaveButton/SaveButton';
import {SaveDropdown} from './components/SaveDropdown/SaveDropdown';
import type {AdditionalButtonTemplate} from './types';
import {useAdditionalItems} from './useAdditionalItems';

import './ChartSaveControl.scss';

type ChartSaveControlProps = {
    className?: string;

    onClickButtonSave: (mode?: EntryUpdateMode) => void;
    onOpenNoRightsDialog: () => void;
    onSaveAsDraftClick: () => void;
    onSaveAndPublishClick: () => void;
    onSaveAsNewClick: () => void;

    additionalControls?: AdditionalButtonTemplate[];
    dropdownItems?: DropdownMenuItemMixed<() => void>[];
    needSplitMainAndAdditionalButtons?: boolean;

    canEdit: boolean;
    isSaveButtonDisabled: boolean;
    isDropdownDisabled: boolean;
    isCurrentRevisionActual: boolean;
    isNewChart: boolean;

    hideSaveButton?: boolean;
    hideSaveDropdown?: boolean;
};

const b = block('action-panel-chart-save-controls');

export const ChartSaveControls: React.FC<ChartSaveControlProps> = (
    props: ChartSaveControlProps,
) => {
    const {
        className,
        additionalControls,
        needSplitMainAndAdditionalButtons,
        canEdit,
        isSaveButtonDisabled,
        isCurrentRevisionActual,
        dropdownItems,
        isDropdownDisabled,
        hideSaveButton,
        hideSaveDropdown,
        onSaveAndPublishClick,
        onSaveAsDraftClick,
        onSaveAsNewClick,
        onClickButtonSave,
        onOpenNoRightsDialog,
        isNewChart,
    } = props;
    const additionalItems = useAdditionalItems({items: additionalControls});

    const isRenameWithoutReload = useSelector(selectIsRenameWithoutReload);

    const mainDropdownItems = React.useMemo<DropdownMenuItemMixed<() => void>[]>(() => {
        const saveAsDraftItem = {
            action: () => onSaveAsDraftClick(),
            text: i18n('component.chart-save-controls', 'button_save-as-draft'),
            extraProps: {
                'data-qa': 'save-as-draft',
            } as any,
            hidden: isNewChart || !canEdit,
        };

        const saveAndPublishItem = {
            action: () => onSaveAndPublishClick(),
            text: i18n('component.chart-save-controls', 'button_save-as-published'),
            hidden: isNewChart,
            extraProps: {
                'data-qa': 'save-and-publish',
            } as any,
        };

        const items: DropdownMenuItemMixed<() => void>[] = [];

        items.push(isCurrentRevisionActual ? saveAsDraftItem : saveAndPublishItem);

        return [
            {
                action: () => onSaveAsNewClick(),
                text: i18n('component.chart-save-controls', 'button_save-as-new'),
                hidden: isNewChart,
                qa: 'save-as-new-chart',
            },
            ...items,
        ];
    }, [
        isNewChart,
        canEdit,
        isCurrentRevisionActual,
        onSaveAsDraftClick,
        onSaveAndPublishClick,
        onSaveAsNewClick,
    ]);

    const allDropdownItems = React.useMemo(
        () => [...mainDropdownItems, ...(dropdownItems || [])],
        [mainDropdownItems, dropdownItems],
    );

    return (
        <div className={b({mobile: DL.IS_MOBILE}, className)}>
            {additionalItems}
            {Boolean(needSplitMainAndAdditionalButtons) && <div className={b('splitter')} />}
            {!hideSaveButton && (
                <React.Fragment>
                    <div className={b('save-btn-wrapper')}>
                        <div
                            key="pseudosave-btn"
                            className={b('pseudosave-btn', {active: !canEdit})}
                            onClick={() => onOpenNoRightsDialog()}
                        />
                        <SaveButton
                            onClick={onClickButtonSave}
                            canEdit={canEdit}
                            disabled={isSaveButtonDisabled}
                            isSaveAsDraft={!isCurrentRevisionActual && !isNewChart}
                        />
                    </div>
                    <NavigationPrompt
                        when={!isSaveButtonDisabled && !isRenameWithoutReload}
                        key="navigation-prompt"
                    />
                </React.Fragment>
            )}
            {!hideSaveDropdown && (
                <SaveDropdown dropdownItems={allDropdownItems} disabled={isDropdownDisabled} />
            )}
        </div>
    );
};
