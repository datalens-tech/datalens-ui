import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';

import {MANAGED_BY} from '../../constants';
import DatasetUtils from '../../helpers/utils';

import iconAvatarTable from 'ui/assets/icons/source-table.svg';

import './Source.scss';

const b = block('source');
const i18n = I18n.keyset('dataset.sources-tab.modify');

const attachDnD = (drag, drop) => (node) => {
    if (drag) {
        drag(node);
    }
    if (drop) {
        drop(node);
    }
};

function SourceMenu(props) {
    const {avatar, avatar: {id, isConnectedWithAvatar} = {}, onClickEditBtn, onDelete} = props;

    return (
        <DropdownMenu
            size="s"
            switcherWrapperClassName={b('btn-menu-control')}
            renderSwitcher={({onClick, onKeyDown}) => (
                <Button size="s" view="flat" onClick={onClick} onKeyDown={onKeyDown}>
                    <Icon className={b('icon-more')} data={Ellipsis} width={14} />
                </Button>
            )}
            popupProps={{placement: ['bottom-start', 'top-start'], qa: 'ds-source-menu'}}
            items={[
                {
                    text: i18n('label_menu-popup-modify-source'),
                    action: (e) => {
                        e.stopPropagation();
                        onClickEditBtn(avatar);
                    },
                },
                {
                    text: i18n('label_menu-popup-delete-source'),
                    disabled: isConnectedWithAvatar,
                    action: (e) => {
                        e.stopPropagation();
                        onDelete({id});
                    },
                },
            ]}
        />
    );
}

function Source(props) {
    const {
        isActive,
        avatar,
        drag,
        dragDisabled,
        drop,
        isOver,
        isDragging,
        onClickEditBtn,
        onDeleteSource,
        position,
    } = props;
    const {id, managed_by, isSource} = avatar;

    const uiId = isActive ? id : undefined;
    const avatarTitle = DatasetUtils.getSourceTitle(avatar);

    return (
        <div
            id={uiId}
            ref={attachDnD(drag, drop)}
            className={b({
                drag: isDragging,
                over: isOver,
                active: isActive,
                source: isSource,
                drag_disabled: dragDisabled || isActive,
            })}
            style={position}
            data-qa="ds-source"
        >
            <Icon className={b('icon-avatar')} data={iconAvatarTable} width={16} height={16} />
            <span title={avatarTitle} className={b('avatar-title')}>
                {avatarTitle}
            </span>
            {managed_by === MANAGED_BY.USER && (
                <SourceMenu
                    avatar={avatar}
                    onClickEditBtn={onClickEditBtn}
                    onDelete={onDeleteSource}
                />
            )}
        </div>
    );
}

SourceMenu.propTypes = {
    avatar: PropTypes.object.isRequired,
    onClickEditBtn: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

Source.propTypes = {
    avatar: PropTypes.object.isRequired,
    isActive: PropTypes.bool,
    isOver: PropTypes.bool,
    isDragging: PropTypes.bool,
    position: PropTypes.shape({
        left: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        top: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
    drag: PropTypes.func,
    drop: PropTypes.func,
    onDeleteSource: PropTypes.func,
    onClickEditBtn: PropTypes.func,
    dragDisabled: PropTypes.bool,
};
Source.defaultProps = {
    isActive: false,
    dragDisabled: false,
};

export default Source;
