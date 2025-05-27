import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {ActionPanelDashSaveControlsQa} from 'shared/constants/qa/action-panel';

const i18n = I18n.keyset('dash.action-panel.view');

export interface SaveDropDownProps {
    isActualRevision: boolean;
    onSavePublishClick: () => void;
    onSaveDraftClick: () => void;
    onSaveAsNewClick: () => void;
}

export const SaveDropDown: React.FC<SaveDropDownProps> = ({
    isActualRevision,
    onSavePublishClick,
    onSaveDraftClick,
    onSaveAsNewClick,
}) => {
    const saveAsDraftItem: DropdownMenuItem = {
        action: () => onSaveDraftClick(),
        text: i18n('label_as_draft'),
        qa: ActionPanelDashSaveControlsQa.SaveAsDraftDropdownItem,
    };
    const saveAndPublishItem: DropdownMenuItem = {
        action: () => onSavePublishClick(),
        text: i18n('label_save_and_publish'),
        qa: ActionPanelDashSaveControlsQa.SaveAndPublishDropdownItem,
    };

    const items: DropdownMenuItem[] = [];
    items.push(isActualRevision ? saveAsDraftItem : saveAndPublishItem);
    items.push({
        action: () => onSaveAsNewClick(),
        text: i18n('label_save_as_new'),
        qa: ActionPanelDashSaveControlsQa.SaveAsNewDropdownItem,
    });

    return (
        <DropdownMenu
            size="s"
            items={items}
            popupProps={{
                className: 'data-qa-action-save-menu',
            }}
            renderSwitcher={() => (
                <Button view="action" size="m" qa="action-button-save-as">
                    <Icon data={ChevronDown} />
                </Button>
            )}
        />
    );
};
