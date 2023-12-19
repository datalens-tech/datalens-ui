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

    const [localText, setLocalText] = React.useState('');

    React.useEffect(() => {
        const value = alias === '' ? name : alias;
        setLocalText(value);
    }, [alias, name]);

    const onLabelClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        onMenuClick({
            entry: {entryId: props.entryId, alias: props.alias},
            action: ENTRY_CONTEXT_MENU_ACTION.EDIT_FAVORITES_ALIAS,
        });
    };

    const isAliasVisible = alias !== '';

    return (
        <>
            <div title={name} className={b('name-line')}>
                <span>{localText}</span>
                {isLocked ? <Icon data={Lock} className={b('lock')} /> : null}
            </div>

            {isAliasVisible && (
                <>
                    <Popover placement={['right', 'left', 'bottom', 'top']} content={name}>
                        <div
                            className={b('row-btn', b('edit-alias-btn', {visible: isAliasVisible}))}
                            onClick={onLabelClick}
                        >
                            <Icon className={b('icon-alias-fill')} data={Tag} />
                            <Icon className={b('icon-alias-stroke')} data={Tag} />
                        </div>
                    </Popover>
                </>
            )}
        </>
    );
};
