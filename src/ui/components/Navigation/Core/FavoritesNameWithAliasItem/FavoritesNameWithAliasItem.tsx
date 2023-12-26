import React from 'react';

import {Lock, Tag} from '@gravity-ui/icons';
import {Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import classNames from 'classnames';
import {I18n} from 'i18n';
import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';

import {MenuClickArgs} from '../../types';

import './FavoritesNameWithAliasItem.scss';

const b = block('dl-core-navigation-favorites-alias');
const i18n = I18n.keyset('component.navigation.view');

type FavoritesNameWithAliasItemProps = {
    entryId: string;
    name: string;
    alias: string;
    isLocked: boolean;
    className?: string;
    onMenuClick: (args: MenuClickArgs) => void;
};

export const FavoritesNameWithAliasItem = (props: FavoritesNameWithAliasItemProps) => {
    const {name, alias, isLocked, className, onMenuClick} = props;

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
        <React.Fragment>
            <div title={text} className={b('name-line')}>
                <span>{text}</span>
                {isLocked ? <Icon data={Lock} className={b('lock')} /> : null}
            </div>

            <div
                className={classNames(className, b('edit-favorites-alias-btn'))}
                onClick={onLabelClick}
            >
                {isAliasVisible ? (
                    <Popover
                        placement={['right', 'left', 'bottom', 'top']}
                        content={
                            <React.Fragment>
                                {i18n('label_original-name')}: <b>{name}</b>
                            </React.Fragment>
                        }
                    >
                        <Icon data={Tag} />
                    </Popover>
                ) : (
                    <Icon data={Tag} />
                )}
            </div>
        </React.Fragment>
    );
};
