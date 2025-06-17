import React from 'react';

import {Plus} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';
import {Icon, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {AddFieldQA} from 'shared';
import {matchDatasetFieldFilter} from 'ui/utils/helpers';

import {DatasetFieldType} from '../../../../../shared/types';
import PlaceholderActionIcon from '../PlaceholderActionIcon/PlaceholderActionIcon';

import './AddField.scss';

export interface AddFieldProps {
    className?: string;
    onAdd: (item: any) => void;
    disabled?: boolean;
    disabledText?: string;
    disabledTextQa?: string;
    dlDebugMode?: boolean;
    items: {
        icon: IconData;
        title: string;
        value: string;
        iconType?: DatasetFieldType;
        description?: string;
        guid?: string;
    }[];
}

interface OptionData {
    icon: React.ReactNode;
    title: string;
    description?: string;
    guid?: string;
}

const b = block('add-field');

export default class AddField extends React.Component<AddFieldProps> {
    render() {
        const {
            className,
            items,
            onAdd,
            disabled,
            disabledText,
            disabledTextQa,
            dlDebugMode = false,
        } = this.props;

        const emptyValueForCorrectUpdate: string[] = [];

        return (
            <div className={b({}, className)}>
                <Select<OptionData>
                    value={emptyValueForCorrectUpdate}
                    virtualizationThreshold={items.length + 1}
                    onUpdate={onAdd}
                    disabled={disabled}
                    renderOption={(option) => {
                        return (
                            <div className={b('option')} data-qa={AddFieldQA.Option}>
                                <span className={b('option-icon')}>{option.data?.icon}</span>{' '}
                                <span className={b('option-text')}>{option.content}</span>
                            </div>
                        );
                    }}
                    filterOption={(option, filter) => {
                        // option.data cannot be undefined, added "if" only for type-check
                        if (option.data) {
                            return matchDatasetFieldFilter(filter, dlDebugMode, {
                                title: option.data.title,
                                description: option.data.description,
                                guid: option.data.guid,
                            });
                        }
                        return true;
                    }}
                    filterable={true}
                    popupClassName={b('popup')}
                    options={items.map((el) => {
                        const isDimension = el.iconType === DatasetFieldType.Dimension;
                        return {
                            value: el.value,
                            content: el.title,
                            data: {
                                icon: (
                                    <Icon
                                        className={
                                            isDimension ? b('dimension-icon') : b('measure-icon')
                                        }
                                        data={el.icon}
                                        width="16"
                                        height="16"
                                        qa={
                                            isDimension
                                                ? AddFieldQA.DimensionsFieldIcon
                                                : AddFieldQA.MeasureFieldIcon
                                        }
                                    />
                                ),
                                description: el.description,
                                guid: el.guid,
                                title: el.title,
                            },
                        };
                    })}
                    renderControl={({triggerProps: {onClick}, ref}) => {
                        const actionProps = disabled
                            ? {
                                  disabledText: (
                                      <div className={b('popup-content')} data-qa={disabledTextQa}>
                                          {disabledText}
                                      </div>
                                  ),
                              }
                            : {qa: AddFieldQA.AddFieldButton, onClick, ref};

                        return <PlaceholderActionIcon icon={Plus} {...actionProps} />;
                    }}
                />
            </div>
        );
    }
}
