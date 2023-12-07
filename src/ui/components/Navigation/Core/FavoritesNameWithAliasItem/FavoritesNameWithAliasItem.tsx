import React, {useEffect} from 'react';

import {ArrowRotateLeft, Lock, Pencil} from '@gravity-ui/icons';
import {Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

const b = block('dl-core-navigation-table-view');

type FavoritesNameWithAliasItemProps = {
    entryId: string;
    name: string;
    alias: string;
    isLocked: boolean;
    onRenameFavorite: (entryId: string, alias: string | null) => void;
};

export const FavoritesNameWithAliasItem = (props: FavoritesNameWithAliasItemProps) => {
    const {entryId, name, alias, isLocked, onRenameFavorite} = props;

    const inputRef = React.useRef<HTMLInputElement>(null);

    const [editMode, setEditMode] = React.useState(false);
    const [localText, setLocalText] = React.useState('');

    useEffect(() => {
        const value = alias === '' ? name : alias;
        setLocalText(value);
    }, [alias, name]);

    const submit = () => {
        const str = localText.trim();
        if (name !== str) {
            onRenameFavorite(entryId, str);
        } else if (alias !== '') {
            onRenameFavorite(entryId, null);
        }

        setEditMode(false);
    };

    const onPencilClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        setEditMode(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') {
            return;
        }

        submit();
    };

    const handleUpdate = (str: string) => setLocalText(str);

    const handleOnInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleBlur = () => submit();

    const onRevertMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        onRenameFavorite(entryId, null);

        setEditMode(false);
    };

    const isPencilVisible = alias !== '';

    return (
        <>
            {editMode ? (
                <div title={name} className={b('name-line')}>
                    <TextInput
                        controlRef={inputRef}
                        className={b('alias-input')}
                        autoComplete="off"
                        autoFocus={true}
                        controlProps={{onClick: handleOnInputClick}}
                        value={localText}
                        onKeyDown={handleKeyDown}
                        onUpdate={handleUpdate}
                        onBlur={handleBlur}
                        rightContent={
                            <div className={b('revert-btn')} onMouseDown={onRevertMouseDown}>
                                <Icon data={ArrowRotateLeft} />
                            </div>
                        }
                    />
                    {isLocked ? <Icon data={Lock} className={b('lock')} /> : null}
                </div>
            ) : (
                <>
                    <div title={name} className={b('name-line')}>
                        <span>{localText}</span>
                        {isLocked ? <Icon data={Lock} className={b('lock')} /> : null}
                    </div>

                    <div
                        className={b('row-btn', b('edit-alias-btn', {visible: isPencilVisible}))}
                        onClick={onPencilClick}
                    >
                        <Icon className={b('icon-pencil-fill')} data={Pencil} />
                        <Icon className={b('icon-pencil-stroke')} data={Pencil} />
                    </div>
                </>
            )}
        </>
    );
};
