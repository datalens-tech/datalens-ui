import React from 'react';

import type {DropdownMenuItem, DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {CopyToClipboard, DropdownMenu} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import type {DatasetField} from 'shared';

import {FieldAction, GROUPED_ITEMS, READONLY_AVAILABLE_ITEMS} from '../constants';
import type {MenuItem} from '../types';

export type FieldActionsPopupProps = {
    field: DatasetField;
    index: number;
    className?: string;
    setActiveRow: (index?: number) => void;
    onItemClick: (data: {action: FieldAction; field: DatasetField}) => void;
    readonly: boolean;
};

const MenuItemText = ({
    action,
    label,
    field,
}: {
    action: FieldAction;
    label: string;
    field: DatasetField;
}) => {
    const content = <span>{i18n('dataset.dataset-editor.modify', label)}</span>;

    if (action === FieldAction.CopyGuid) {
        return (
            <CopyToClipboard text={field.guid} timeout={0}>
                {() => content}
            </CopyToClipboard>
        );
    }

    return content;
};

const getMenuItems = (
    field: DatasetField,
    onClick: FieldActionsPopupProps['onItemClick'],
    readonly: boolean,
): DropdownMenuItemMixed<MenuItem>[] => {
    return GROUPED_ITEMS.reduce<DropdownMenuItemMixed<MenuItem>[]>((items, group) => {
        const groupWithoutHidden = group.reduce<DropdownMenuItem<MenuItem>[]>(
            (group, {action, label, theme, hidden = false}) => {
                if (readonly && !READONLY_AVAILABLE_ITEMS.includes(action)) {
                    return group;
                }

                if (!hidden) {
                    group.push({
                        theme,
                        hidden,
                        text: <MenuItemText action={action} label={label} field={field} />,
                        action: () => onClick({action, field}),
                    });
                }

                return group;
            },
            [],
        );

        if (groupWithoutHidden.length) {
            items.push(groupWithoutHidden);
        }
        return items;
    }, []);
};

export function FieldActionsPopup(props: FieldActionsPopupProps) {
    const {className, field, index, setActiveRow, onItemClick, readonly} = props;
    const [open, setOpen] = React.useState(false);

    const handleMenuToggle = () => {
        setActiveRow(open ? undefined : index);
        setOpen(!open);
    };

    return (
        <DropdownMenu
            size="s"
            switcherWrapperClassName={className}
            items={getMenuItems(field, onItemClick, readonly)}
            popupProps={{
                placement: ['bottom-end', 'top-end'],
            }}
            onOpenToggle={handleMenuToggle}
        />
    );
}
