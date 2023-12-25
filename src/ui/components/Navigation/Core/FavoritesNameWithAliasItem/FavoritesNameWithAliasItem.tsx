import React from 'react';

import {Lock, Tag} from '@gravity-ui/icons';
import {Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';

import {MenuClickArgs} from '../../types';

import './FavoritesNameWithAliasItem.scss';

const b = block('dl-core-navigation-favorites-alias');

type FavoritesNameWithAliasItemProps = {
    entryId: string;
    name: string;
    alias: string;
    isLocked: boolean;
    onMenuClick: (args: MenuClickArgs) => void;
};

export const FavoritesNameWithAliasItem = (props: FavoritesNameWithAliasItemProps) => {
    const {name, alias, isLocked, onMenuClick} = props;

    const onLabelClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        onMenuClick({
            entry: {entryId: props.entryId, alias: props.alias},
            action: ENTRY_CONTEXT_MENU_ACTION.EDIT_FAVORITES_ALIAS,
        });
    };

    const text = alias === '' ? name : alias;
    const isAliasVisible = alias !== '';

    return (
        <>
            <div title={text} className={b('name-line')}>
                <span>{text}</span>
                {isLocked ? <Icon data={Lock} className={b('lock')} /> : null}
            </div>
            {isAliasVisible && (
                <Popover placement={['right', 'left', 'bottom', 'top']} content={name}>
                    <div
                        className={b('row-btn', b('edit-alias-btn', {visible: isAliasVisible}))}
                        onClick={onLabelClick}
                    >
                        <Icon data={Tag} />
                    </div>
                </Popover>
            )}
        </>
    );
};
