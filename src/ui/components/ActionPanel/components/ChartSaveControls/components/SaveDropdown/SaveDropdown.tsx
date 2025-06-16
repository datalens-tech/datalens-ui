import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
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
            renderSwitcher={({onClick, onKeyDown}) => (
                <Button
                    className={b('switcher')}
                    view="action"
                    disabled={disabled}
                    size="m"
                    qa={ChartSaveControlsQA.SaveMoreDropdown}
                    onClick={onClick}
                    onKeyDown={onKeyDown}
                >
                    <Icon data={ChevronDown} size={16} />
                </Button>
            )}
        />
    );
};
