import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Button, ButtonSize, DropdownMenu, DropdownMenuItem, Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import {DashboardAddWidgetQa} from 'shared/constants/qa/dash';
import Utils from 'utils';

import {DIALOG_TYPE} from '../../../containers/Dialogs/constants';
import {CopiedConfigData, getPastedWidgetData} from '../../../modules/helpers';

const i18n = I18n.keyset('dash.action-panel.view');

export interface AddWidgetProps {
    openDialog: (dialogType: string) => void;
    onPasteWidget: (data: CopiedConfigData) => void;
    buttonSize?: ButtonSize;
}

export const AddWidget: React.FC<AddWidgetProps> = ({
    openDialog,
    onPasteWidget,
    buttonSize = 'm',
}) => {
    const [itemData, setItemData] = React.useState(() => getPastedWidgetData());

    const items: DropdownMenuItem[] = [
        {
            action: async () => {
                openDialog(DIALOG_TYPE.WIDGET);
            },
            text: i18n('value_widget'),
            qa: DashboardAddWidgetQa.AddWidget,
        },
        {
            action: () => openDialog(DIALOG_TYPE.CONTROL),
            text: i18n('value_control'),
            qa: DashboardAddWidgetQa.AddControl,
        },
        {
            action: () => openDialog(DIALOG_TYPE.TEXT),
            text: i18n('value_text'),
            qa: DashboardAddWidgetQa.AddText,
        },
        {
            action: () => openDialog(DIALOG_TYPE.TITLE),
            text: i18n('value_title'),
            qa: DashboardAddWidgetQa.AddTitle,
        },
    ];

    if (Utils.isEnabledFeature(Feature.GroupControls)) {
        items.push({
            action: () => openDialog(DIALOG_TYPE.GROUP_CONTROL),
            text: i18n('value_group-selector'),
        });
    }

    if (itemData) {
        items.push({
            action: () => onPasteWidget(itemData),
            text: i18n('value_paste_item'),
        });
    }

    return (
        <DropdownMenu
            size="s"
            items={items}
            switcher={
                <Button
                    view="normal"
                    size={buttonSize}
                    onClick={() => setItemData(getPastedWidgetData())}
                    qa="action-button-add"
                >
                    {i18n('button_add')}
                    <Icon data={ChevronDown} />
                </Button>
            }
        />
    );
};
