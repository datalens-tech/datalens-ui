import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Button, DropdownMenu, DropdownMenuItemMixed, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ChartSaveControlsQA} from 'shared';

import './SaveDropdown.scss';

type SaveDropdownProps = {
    dropdownItems: DropdownMenuItemMixed<() => void>[];
    disabled: boolean;
};

const b = block('action-panel-save-dropdown');

export const SaveDropdown: React.FC<SaveDropdownProps> = (props: SaveDropdownProps) => {
    const {disabled, dropdownItems} = props;

    return (
        <DropdownMenu
            key="save-more-dropdown"
            size="s"
            disabled={disabled}
            items={dropdownItems}
            switcher={
                <Button
                    className={b('switcher')}
                    view="action"
                    disabled={disabled}
                    size="m"
                    qa={ChartSaveControlsQA.SaveMoreDropdown}
                >
                    <Icon data={ChevronDown} size={16} />
                </Button>
            }
        />
    );
};
