import React from 'react';

import {Plus} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';
import {Popover as CommonTooltip, Icon, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import {AddFieldQA} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {selectDebugMode} from 'ui/store/selectors/user';

import {DatasetFieldType} from '../../../../../shared/types';
import {matchFieldFilter} from '../../utils/helpers';
import PlaceholderActionIcon from '../PlaceholderActionIcon/PlaceholderActionIcon';

import './AddField.scss';

export interface AddFieldProps {
    className?: string;
    onAdd: (item: any) => void;
    disabled?: boolean;
    disabledText?: string;
    disabledTextQa?: string;
    dlDebugMode: boolean;
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

const preventTooltipCloseOnClick = () => false;

class AddField extends React.Component<AddFieldProps> {
    render() {
        const {className, items, onAdd, disabled, disabledText, disabledTextQa, dlDebugMode} =
            this.props;

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
                            <div className={b('option')}>
                                <span className={b('option-icon')}>{option.data?.icon}</span>{' '}
                                <span className={b('option-text')}>{option.content}</span>
                            </div>
                        );
                    }}
                    filterOption={(option, filter) => {
                        // option.data cannot be undefined, added if only for type-check
                        if (option.data) {
                            return matchFieldFilter(filter, dlDebugMode, {
                                title: option.data.title,
                                description: option.data.description,
                                guid: option.data.guid,
                            });
                        }
                        return true;
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
                            description: el.description,
                            guid: el.guid,
                            title: el.title,
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

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        dlDebugMode: selectDebugMode(state),
    };
};

export default connect(mapStateToProps)(AddField);
