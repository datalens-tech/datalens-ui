import React from 'react';

import {Plus} from '@gravity-ui/icons';
import {
    ActionTooltip,
    Button,
    DropdownMenu,
    Select,
    TextInput,
    getSelectFilteredOptions,
    useSelectOptions,
} from '@gravity-ui/uikit';
import type {SelectOption} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DatasetFieldType} from 'shared';
import type {DatasetField} from 'shared';
import DataTypeIcon from 'ui/components/DataTypeIcon/DataTypeIcon';
import type {DataTypeIconProps} from 'ui/components/DataTypeIcon/DataTypeIcon';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import {TAB_SOURCES} from '../../../constants';
import type {OnParamCreate, OnParamEdit} from '../types';

const b = block('source-editor-dialog');
const i18n = I18n.keyset('dataset.sources-tab.modify');

export interface ParamSelectorProps {
    onParamCreate: OnParamCreate;
    onParamEdit: OnParamEdit;
    onParamSelect: (param: DatasetField) => void;
    parameters: DatasetField[];
    buttonText?: React.ReactNode;
    className?: string;
}

export type RenderParamSelector = (args: {
    onParamSelect: ParamSelectorProps['onParamSelect'];
    buttonText?: string;
    className?: string;
}) => React.ReactNode;

export function ParamSelector(props: ParamSelectorProps) {
    const {parameters, buttonText, className, onParamCreate, onParamEdit, onParamSelect} = props;
    const [filter, setFilter] = React.useState('');
    const options = useSelectOptions({
        options: parameters.map((param) => {
            const iconProps: DataTypeIconProps = {
                dataType: param.data_type,
                fieldType: DatasetFieldType.Parameter,
            };

            return {
                content: param.title,
                data: {iconProps, param},
                value: param.guid,
            };
        }),
        filter,
        filterable: true,
    });
    const filteredOptions = getSelectFilteredOptions(options) as SelectOption<{
        iconProps: DataTypeIconProps;
        param: DatasetField;
    }>[];

    return (
        <Select
            filterable={true}
            value={[]}
            renderEmptyOptions={() => {
                return (
                    <PlaceholderIllustration
                        name="template"
                        size="s"
                        direction="column"
                        className={b('param-select-empty-placeholder')}
                        title={i18n('label_param-select-empty-placeholder-title')}
                        description={i18n('label_param-select-empty-placeholder-description')}
                    />
                );
            }}
            popupPlacement={buttonText ? undefined : 'right-start'}
            onFilterChange={setFilter}
            onUpdate={(value) => {
                const selectedParamGuid = value[0];
                const selectedOption = filteredOptions.find(
                    (option) => option.value === selectedParamGuid,
                );
                if (!selectedOption || !selectedOption.data?.param) {
                    return;
                }
                onParamSelect(selectedOption.data.param);
            }}
            popupClassName={b('param-select-popup')}
            renderControl={({triggerProps, ref}) => {
                return (
                    <Button
                        {...triggerProps}
                        ref={ref}
                        className={b('param-add-button', className)}
                    >
                        <Button.Icon>
                            <Plus />
                        </Button.Icon>
                        {buttonText}
                    </Button>
                );
            }}
            renderFilter={({inputProps: {value, onChange, onKeyDown, ...controlProps}, ref}) => {
                return (
                    <div className={b('param-select-filter', {empty: !filteredOptions.length})}>
                        <TextInput
                            controlRef={ref}
                            controlProps={controlProps}
                            value={value}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                        />
                    </div>
                );
            }}
            renderPopup={({renderFilter, renderList}) => {
                return (
                    <React.Fragment>
                        {renderFilter()}
                        {Boolean(filteredOptions.length || !options.length) && renderList()}
                        <Button
                            className={b('param-select-add-button')}
                            view="flat"
                            pin="brick-brick"
                            width="max"
                            onClick={() =>
                                onParamCreate({tab: TAB_SOURCES, showTemplateWarn: true})
                            }
                        >
                            <Button.Icon>
                                <Plus />
                            </Button.Icon>
                            {i18n('button_create-param')}
                        </Button>
                    </React.Fragment>
                );
            }}
        >
            {filteredOptions.map((option) => {
                const field = option.data?.param;
                const templateEnabled = field?.template_enabled;
                const content = (
                    <div className={b('param-select-option')}>
                        {option.data?.iconProps && <DataTypeIcon {...option.data.iconProps} />}
                        {option.content}
                        <DropdownMenu
                            switcherWrapperClassName={b('param-select-option-dropdown')}
                            size="s"
                            popupProps={{
                                offset: [0, 0],
                            }}
                            onSwitcherClick={(e) => {
                                e.stopPropagation();
                            }}
                            items={[
                                {
                                    text: i18n('label_param-select-option-edit'),
                                    action: (e) => {
                                        e.stopPropagation();

                                        if (!field) {
                                            return;
                                        }

                                        onParamEdit({field});
                                    },
                                },
                            ]}
                        />
                    </div>
                );
                return (
                    <Select.Option
                        key={option.value}
                        value={option.value}
                        disabled={!templateEnabled}
                    >
                        {templateEnabled ? (
                            content
                        ) : (
                            <ActionTooltip
                                className={b('settings-templating-disable-hint')}
                                title={i18n('label_param-select-option-disabled')}
                                placement={['left', 'right']}
                            >
                                {content}
                            </ActionTooltip>
                        )}
                    </Select.Option>
                );
            })}
        </Select>
    );
}
