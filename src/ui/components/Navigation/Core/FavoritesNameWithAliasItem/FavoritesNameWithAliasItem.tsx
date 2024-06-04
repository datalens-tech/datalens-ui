import React from 'react';

import {Lock, Tag} from '@gravity-ui/icons';
import {Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import classNames from 'classnames';
import {I18n} from 'i18n';
import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';
import {DL} from 'ui/constants';

import type {MenuClickArgs} from '../../types';

import './FavoritesNameWithAliasItem.scss';

const b = block('dl-core-navigation-favorites-alias');
const i18n = I18n.keyset('component.navigation.view');

type FavoritesNameWithAliasItemProps = {
    entryId: string;
    name: string;
    displayAlias?: string | null;
    isLocked: boolean;
    className?: string;
    onMenuClick?: (args: MenuClickArgs) => void;
};

const TagIcon = ({isAliasVisible, name}: {isAliasVisible: boolean; name: string}) => {
    return (
        <React.Fragment>
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
        </React.Fragment>
    );
};

export const FavoritesNameWithAliasItem = (props: FavoritesNameWithAliasItemProps) => {
    const {name, displayAlias, isLocked, className, onMenuClick} = props;

    const onLabelClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        onMenuClick?.({
            entry: {entryId: props.entryId, displayAlias: props.displayAlias},
            action: ENTRY_CONTEXT_MENU_ACTION.EDIT_FAVORITES_ALIAS,
        });
    };

    const isAliasVisible = Boolean(displayAlias);
    const showTag = isAliasVisible || !DL.IS_MOBILE;
    const text = displayAlias ? displayAlias : name;

    return (
        <React.Fragment>
            <div title={text} className={b('name-line')}>
                <span>{text}</span>
                {isLocked ? <Icon data={Lock} className={b('lock')} /> : null}
            </div>

            {showTag && (
                <div
                    className={classNames(className, b('edit-favorites-alias-btn'))}
                    onClick={onLabelClick}
                >
                    <TagIcon name={name} isAliasVisible={isAliasVisible} />
                </div>
            )}
        </React.Fragment>
    );
};
