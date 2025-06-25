import React from 'react';

import {ItemSelector} from '@gravity-ui/components';
import {Dialog as CommonDialog, HelpMark, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import omit from 'lodash/omit';
import type {Field} from 'shared';
import {HierarchyEditorQa} from 'shared';
import {helpMarkDefaultProps} from 'ui/constants';
import {getIconForDataType} from 'units/wizard/utils/helpers';

import './HierarchyEditor.scss';

const b = block('hierarchy-editor');

interface Props {
    fields: Field[];
    value: string[];
    hierarchyName: string;
    hierarchyNameError?: string;
    hierarchyHasInvalidFields?: boolean;
    visible: boolean;
    onClose: () => void;
    onApply: () => void;
    onHierarchyNameChange: (value: string) => void;
    onChange: (value: string[]) => void;
}

interface State {
    selectedFields: Record<string, boolean>;
}

class HierarchyEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            selectedFields: this.getSelectedFields(this.props.value),
        };
    }
    render() {
        const {
            value,
            hierarchyName,
            hierarchyNameError,
            hierarchyHasInvalidFields,
            fields,
            onClose,
            onApply,
            visible,
            onHierarchyNameChange,
            onChange,
        } = this.props;
        const saveButtonDisabled = Boolean(
            value.length < 2 || !hierarchyName || hierarchyNameError || hierarchyHasInvalidFields,
        );

        return (
            <CommonDialog size="m" open={visible} onClose={onClose}>
                <div className={b()} data-qa={HierarchyEditorQa.Dialog}>
                    <CommonDialog.Header
                        caption={
                            <span>
                                {i18n('wizard.hierarchy-editor', 'caption')}
                                <HelpMark {...helpMarkDefaultProps} className={b('help-icon')}>
                                    {i18n('wizard.hierarchy-editor', 'help_tooltip')}
                                </HelpMark>
                            </span>
                        }
                    />

                    <CommonDialog.Body className={b('body')}>
                        <div className={b('hierarchy-name-input-wrapper')}>
                            <TextInput
                                size="s"
                                placeholder={i18n('wizard.hierarchy-editor', 'name-placeholder')}
                                value={hierarchyName}
                                onUpdate={onHierarchyNameChange}
                                error={hierarchyNameError}
                                qa="hierarchy-name-input"
                            />
                        </div>
                        <CommonDialog.Divider className={b('dialog-divider')} />
                        <ItemSelector
                            selectorTitle={i18n('wizard.hierarchy-editor', 'selector_title')}
                            items={fields}
                            value={value}
                            onUpdate={(values) => {
                                this.setState({
                                    selectedFields: this.getSelectedFields(values),
                                });
                                onChange(values);
                            }}
                            filterItem={this.filterItem}
                            getItemId={(item: Field) => item.title}
                            renderItemValue={this.renderItemValue}
                            hideSelectAllButton={true}
                        />
                        <CommonDialog.Divider className={b('dialog-divider')} />
                    </CommonDialog.Body>
                    <CommonDialog.Footer
                        onClickButtonCancel={onClose}
                        onClickButtonApply={onApply}
                        textButtonApply={i18n('wizard.hierarchy-editor', 'button_save')}
                        textButtonCancel={i18n('wizard.hierarchy-editor', 'button_cancel')}
                        propsButtonApply={{
                            disabled: saveButtonDisabled,
                            qa: HierarchyEditorQa.ApplyButton,
                        }}
                    />
                </div>
            </CommonDialog>
        );
    }

    filterItem(filter: string) {
        return (item: Field) => item.title.toLowerCase().includes(filter.toLowerCase());
    }

    renderItemValue = (item: Field) => {
        return (
            <div
                className={b('item', {
                    error: !item.valid,
                })}
                onClick={() => {
                    let resultValue: string[] = [];
                    if (this.state.selectedFields[item.title]) {
                        const updatedSelectedFields = omit(this.state.selectedFields, item.title);
                        this.setState({selectedFields: updatedSelectedFields});
                        resultValue = this.props.value.filter((title) => title !== item.title);
                    } else {
                        resultValue = [...this.props.value, item.title];
                        this.setState({
                            selectedFields: {...this.state.selectedFields, [item.title]: true},
                        });
                    }
                    this.props.onChange(resultValue);
                }}
            >
                <Icon
                    className={b('item-icon', {
                        error: !item.valid,
                    })}
                    data={getIconForDataType(item.data_type)}
                    width="16"
                    height="16"
                />
                {item.title}
            </div>
        );
    };

    getSelectedFields = (values: string[]) => {
        return values.reduce(
            (acc, value) => {
                acc[value] = true;
                return acc;
            },
            {} as Record<string, boolean>,
        );
    };
}

export default HierarchyEditor;
