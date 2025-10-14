import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import type {ListItemData} from '@gravity-ui/uikit';
import {Button, Icon, List, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import update from 'immutability-helper';
import difference from 'lodash/difference';
import {ControlQA} from 'shared';

import './SelectorValuesDialogBody.scss';

const b = block('control-select-acceptable');

type SelectorValuesDialogBodyProps = {
    currentAcceptableValues: string[];
    handleUpdate: (updatedValue: string) => void;
    newValue: string;
    handleKeyPress: React.KeyboardEventHandler<HTMLInputElement>;
    inputRef: React.RefObject<HTMLInputElement>;
    addItem: () => void;
    setCurrentAcceptableValues: React.Dispatch<React.SetStateAction<string[]>>;
    setNewValue: React.Dispatch<React.SetStateAction<string>>;
};

export const SelectorValuesDialogBody = (props: SelectorValuesDialogBodyProps) => {
    const {
        currentAcceptableValues,
        handleUpdate,
        newValue,
        handleKeyPress,
        inputRef,
        addItem,
        setCurrentAcceptableValues,
        setNewValue,
    } = props;
    const isEmpty = !currentAcceptableValues.length;

    const handleOnSortEnd = ({
        oldIndex,
        newIndex,
        acceptableValues,
    }: {
        oldIndex: number;
        newIndex: number;
        acceptableValues: string[];
    }) => {
        if (oldIndex === newIndex) {
            return;
        }
        const newItems = update(acceptableValues, {
            $splice: [
                [oldIndex, 1],
                [newIndex, 0, acceptableValues[oldIndex]],
            ],
        });

        setCurrentAcceptableValues(newItems);
    };

    const handleRemoveItemClick = (index: number, acceptableValues: string[]) => {
        setCurrentAcceptableValues([
            ...acceptableValues.slice(0, index),
            ...acceptableValues.slice(index + 1),
        ]);
    };

    const addItemsFromBuffer = React.useCallback(
        (e: ClipboardEvent) => {
            const text: string = (e.clipboardData || window.clipboardData).getData('text') || '';
            if (!text) {
                return;
            }
            const newValuesArr = text.split('\n').filter((item: string) => item.trim());
            const differentNewValuesArr: string[] = difference(
                newValuesArr,
                currentAcceptableValues,
            );
            if (differentNewValuesArr.length > 1) {
                e.stopPropagation();
                e.preventDefault();
                setNewValue('');
                setCurrentAcceptableValues([...differentNewValuesArr, ...currentAcceptableValues]);
            }
        },
        [setNewValue, setCurrentAcceptableValues, currentAcceptableValues],
    );

    React.useEffect(() => {
        const input = inputRef?.current;
        input?.addEventListener('paste', addItemsFromBuffer);

        return () => {
            input?.removeEventListener('paste', addItemsFromBuffer);
        };
    }, [inputRef, addItemsFromBuffer]);

    const renderListItem = (args: {
        item: ListItemData<string>;
        itemIndex: number;
        acceptableValues: string[];
    }) => {
        const {item, itemIndex, acceptableValues} = args;
        return (
            <div className={b('item')} key={item} data-qa={ControlQA.controlSelectAcceptableItem}>
                <span title={item}>{item}</span>
                <Button
                    onClick={() => handleRemoveItemClick(itemIndex, acceptableValues)}
                    className={b('remove')}
                    qa={ControlQA.controlSelectAcceptableRemoveButton}
                    view="flat"
                    size="s"
                >
                    <Icon data={Xmark} width="16" />
                </Button>
            </div>
        );
    };

    return (
        <React.Fragment>
            <div className={b('header')} data-qa={ControlQA.controlSelectAcceptable}>
                <TextInput
                    size="m"
                    qa={ControlQA.controlSelectAcceptableInput}
                    placeholder={i18n('dash.control-dialog.edit', 'context_add-value')}
                    onUpdate={handleUpdate}
                    value={newValue}
                    onKeyDown={handleKeyPress}
                    controlRef={inputRef}
                />
                <Button
                    view="normal"
                    size="m"
                    qa={ControlQA.controlSelectAcceptableButton}
                    onClick={addItem}
                >
                    {i18n('dash.control-dialog.edit', 'button_add')}
                </Button>
            </div>
            <div className={b('items', {empty: isEmpty})}>
                {isEmpty ? (
                    i18n('dash.control-dialog.edit', 'label_empty-list')
                ) : (
                    <List
                        filterable={false}
                        virtualized={false}
                        sortable={true}
                        items={currentAcceptableValues}
                        itemClassName={b('list-item')}
                        onSortEnd={(args) =>
                            handleOnSortEnd({
                                ...args,
                                acceptableValues: currentAcceptableValues,
                            })
                        }
                        renderItem={(
                            item: ListItemData<string>,
                            _isItemActive: boolean,
                            itemIndex: number,
                        ) =>
                            renderListItem({
                                item,
                                itemIndex,
                                acceptableValues: currentAcceptableValues,
                            })
                        }
                    />
                )}
            </div>
        </React.Fragment>
    );
};
