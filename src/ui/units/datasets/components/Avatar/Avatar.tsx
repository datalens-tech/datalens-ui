import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ConnectDropTarget} from 'react-dnd';
import type {DatasetSource, DatasetSourceAvatar} from 'shared';
import {AvatarQA} from 'shared';

import DatasetUtils from '../../helpers/utils';
import {withDroppingOnSourceReplaceArea} from '../hoc/AvatarDnD';

import iconCross from 'ui/assets/icons/cross.svg';
import iconAvatarTable from 'ui/assets/icons/source-table.svg';
import iconSync from 'ui/assets/icons/sync.svg';

import './Avatar.scss';

const b = block('avatar');

type DnDFunc = (node: React.ReactNode) => void;

const attachDnD =
    (drag: DnDFunc, drop: DnDFunc, options: {dragDisabled: boolean}) => (node: React.ReactNode) => {
        const {dragDisabled} = options;

        if (drag && !dragDisabled) {
            drag(node);
        }
        if (drop) {
            drop(node);
        }
    };

type DeleteAvatarButtonProps = {
    id?: string;
    onClick: (args: {id?: string}) => void;
};

function DeleteAvatarButton(props: DeleteAvatarButtonProps) {
    const {id, onClick} = props;

    return (
        <Button
            qa={AvatarQA.DeleteButton}
            className={b('btn-delete-avatar')}
            view="flat"
            size="s"
            onClick={(e) => {
                e.stopPropagation();

                onClick({id});
            }}
        >
            <Icon className={b('icon-cross')} data={iconCross} width={18} height={18} />
        </Button>
    );
}

type ReplaceSourceAreaProps = {
    drop: ConnectDropTarget;
    isOver?: boolean;
};

function ReplaceSourceArea(props: ReplaceSourceAreaProps) {
    const {drop, isOver} = props;

    return (
        <div ref={drop} className={b('replace-source-area', {over: isOver})}>
            <Icon data={iconSync} width={20} height={20} />
        </div>
    );
}

const ReplaceSourceAreaWithDrop = withDroppingOnSourceReplaceArea(ReplaceSourceArea);

type RightAreaProps = {
    avatar: DatasetSourceAvatar | DatasetSource;
    onDelete: (args: {id?: string}) => void;
    replaceSource: (source: DatasetSource, avatar: DatasetSourceAvatar) => void;
    isDisplayReplaceSourceZone?: boolean;
    isDisplayDeleteButton?: boolean;
};

function RightArea(props: RightAreaProps) {
    const {
        avatar,
        avatar: {id} = {},
        replaceSource,
        isDisplayReplaceSourceZone,
        isDisplayDeleteButton,
        onDelete,
    } = props;

    if (isDisplayReplaceSourceZone) {
        return <ReplaceSourceAreaWithDrop avatar={avatar} onDrop={replaceSource} />;
    }

    return (
        <React.Fragment>
            {isDisplayDeleteButton && <DeleteAvatarButton id={id} onClick={onDelete} />}
        </React.Fragment>
    );
}

type AvatarProps = {
    avatar: {isSource?: boolean} & (DatasetSource | DatasetSourceAvatar);
    replaceSource: (source: DatasetSource, avatar: DatasetSourceAvatar) => void;
    isDisplayReplaceSourceZone?: boolean;
    isActive?: boolean;
    isOver?: boolean;
    isDragging?: boolean;
    position?: {
        left: string | number;
        top: string | number;
    };
    drag: DnDFunc;
    drop: DnDFunc;
    onDeleteAvatar: (avatar: {id?: string}) => void;
    onDeleteSource: (source: {id?: string}) => void;
    dragDisabled?: boolean;
    readonly: boolean;
};

function Avatar(props: AvatarProps) {
    const {
        isActive = false,
        avatar,
        drag,
        dragDisabled = false,
        drop,
        isOver,
        isDragging,
        isDisplayReplaceSourceZone,
        onDeleteAvatar,
        onDeleteSource,
        replaceSource,
        position,
        readonly = false,
    } = props;
    const {id, isSource} = avatar;

    const uiId = isActive ? id : undefined;
    const isDragDisabled = dragDisabled || isActive;
    const avatarTitle = DatasetUtils.getSourceTitle(avatar);

    return (
        <div
            id={uiId}
            ref={attachDnD(drag, drop, {
                dragDisabled: isDragDisabled,
            })}
            className={b({
                drag: isDragging,
                over: isOver,
                active: isActive,
                source: isSource,
                drag_disabled: isDragDisabled,
            })}
            style={position}
            data-qa="ds-avatar"
        >
            <Icon className={b('icon-avatar')} data={iconAvatarTable} width={16} height={16} />
            <span className={b('avatar-title')} title={avatarTitle}>
                {avatarTitle}
            </span>
            <RightArea
                avatar={avatar}
                isDisplayReplaceSourceZone={isDisplayReplaceSourceZone && !readonly}
                isDisplayDeleteButton={isActive && !readonly}
                onDelete={isSource ? onDeleteSource : onDeleteAvatar}
                replaceSource={replaceSource}
            />
        </div>
    );
}

export default Avatar;
