import React from 'react';

import {Plus} from '@gravity-ui/icons';
import type {IconData, SelectOption} from '@gravity-ui/uikit';
import {Popover as CommonTooltip, Icon, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {AddFieldQA} from 'shared';

import {DatasetFieldType} from '../../../../../shared/types';
import PlaceholderActionIcon from '../PlaceholderActionIcon/PlaceholderActionIcon';

import './AddField.scss';

export interface AddFieldProps {
    className?: string;
    onAdd: (item: any) => void;
    disabled?: boolean;
    disabledText?: string;
    disabledTextQa?: string;
    items: {
        icon: IconData;
        title: string;
        value: string;
        iconType?: DatasetFieldType;
    }[];
}

const b = block('add-field');

const preventTooltipCloseOnClick = () => false;

class AddField extends React.Component<AddFieldProps> {
    render() {
        const {className, items, onAdd, disabled, disabledText, disabledTextQa} = this.props;

        const emptyValueForCorrectUpdate: string[] = [];

        return (
            <div className={b({}, className)}>
                <Select
                    value={emptyValueForCorrectUpdate}
                    virtualizationThreshold={items.length + 1}
                    onUpdate={onAdd}
                    disabled={disabled}
                    renderOption={(option: SelectOption<{icon: React.ReactNode}>) => {
                        return (
                            <div className={b('option')}>
                                <span className={b('option-icon')}>{option.data?.icon}</span>{' '}
                                <span className={b('option-text')}>{option.content}</span>
                            </div>
                        );
                    }}
                    filterable={true}
                    popupClassName={b('popup')}
                    options={items.map((el) => ({
                        value: el.value,
                        content: el.title,
                        data: {
                            icon: (
                                <Icon
                                    className={
                                        el.iconType === DatasetFieldType.Dimension
                                            ? b('dimension-icon')
                                            : b('measure-icon')
                                    }
                                    data={el.icon}
                                    width="16"
                                    height="16"
                                />
                            ),
                        },
                    }))}
                    renderControl={({onClick, ref}) => {
                        const actionIcon = <PlaceholderActionIcon icon={Plus} />;

                        return disabled ? (
                            <CommonTooltip
                                placement={['top', 'bottom']}
                                content={<span data-qa={disabledTextQa}>{disabledText}</span>}
                                onClick={preventTooltipCloseOnClick}
                            >
                                {actionIcon}
                            </CommonTooltip>
                        ) : (
                            <span data-qa={AddFieldQA.AddFieldButton} onClick={onClick} ref={ref}>
                                {actionIcon}
                            </span>
                        );
                    }}
                />
            </div>
        );
    }
}

export default AddField;
