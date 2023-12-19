import React from 'react';

import {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {EntryUpdateMode} from 'shared';

import NavigationPrompt from '../../../NavigationPrompt/NavigationPrompt';

import {SaveButton} from './components/SaveButton/SaveButton';
import {SaveDropdown} from './components/SaveDropdown/SaveDropdown';
import {AdditionalButtonTemplate} from './types';
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

    isLocked: boolean;
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
        isLocked,
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

    const mainDropdownItems = React.useMemo<DropdownMenuItemMixed<() => void>[]>(() => {
        const saveAsDraftItem = {
            action: () => onSaveAsDraftClick(),
            text: i18n('component.chart-save-controls', 'button_save-as-draft'),
            extraProps: {
                'data-qa': 'save-as-draft',
            } as any,
            hidden: isNewChart || isLocked,
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
        isCurrentRevisionActual,
        onSaveAndPublishClick,
        onSaveAsDraftClick,
        onSaveAsNewClick,
        isNewChart,
    ]);

    const allDropdownItems = React.useMemo(
        () => [...mainDropdownItems, ...(dropdownItems || [])],
        [mainDropdownItems, dropdownItems],
    );

    return (
        <div className={b(null, className)}>
            {additionalItems}
            {Boolean(needSplitMainAndAdditionalButtons) && <div className={b('splitter')} />}
            {!hideSaveButton && (
                <React.Fragment>
                    <div
                        key="pseudosave-btn"
                        className={b('pseudosave-btn', {active: isLocked})}
                        onClick={() => onOpenNoRightsDialog()}
                    />
                    <SaveButton
                        onClick={onClickButtonSave}
                        isLocked={isLocked}
                        disabled={isSaveButtonDisabled}
                        isSaveAsDraft={!isCurrentRevisionActual && !isNewChart}
                    />
                    <NavigationPrompt when={!isSaveButtonDisabled} key="navigation-prompt" />
                </React.Fragment>
            )}
            {!hideSaveDropdown && (
                <SaveDropdown dropdownItems={allDropdownItems} disabled={isDropdownDisabled} />
            )}
        </div>
    );
};
