import React from 'react';

import {Button, Checkbox, Dialog, HelpMark, Icon, Select} from '@gravity-ui/uikit';
import type {SelectOption, SelectRenderControlProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import _get from 'lodash/get';
import _merge from 'lodash/merge';
import type {
    DATASET_FIELD_TYPES,
    DatasetAvatarRelation,
    DatasetAvatarRelationCondition,
    DatasetOptions,
    DatasetRawSchema,
    DatasetSource,
    DatasetSourceAvatar,
} from 'shared';
import {DatasetDialogRelationQA} from 'shared';
import {DataTypeIcon, withHiddenUnmount} from 'ui';

import {
    BINARY_JOIN_OPERATORS,
    CONDITION_FIELD_TYPES,
    CONDITION_TYPES,
    JOIN_TYPES,
    JOIN_TYPES_ICONS,
} from '../../constants';
import DatasetUtils from '../../helpers/utils';

import iconCross from 'ui/assets/icons/cross.svg';
import iconTable from 'ui/assets/icons/source-table.svg';

import './RelationDialog.scss';

const b = block('relation-dialog');
const i18n = I18n.keyset('dataset.sources-tab.modify');
const sortByTile = DatasetUtils.sortObjectBy('title');

const getFieldItems = (items: DatasetRawSchema[]): SelectOption[] => {
    return items.map(
        ({name, title, user_type: userType}): SelectOption => ({
            value: name,
            content: title,
            data: {
                iconNode: (
                    <DataTypeIcon
                        className={b('field-type')}
                        dataType={userType as DATASET_FIELD_TYPES}
                    />
                ),
            },
        }),
    );
};
const getJoinTypeItems = (types: string[]): SelectOption[] => {
    return Object.entries(JOIN_TYPES_ICONS)
        .filter(([iconType]) => types.includes(iconType))
        .map(
            ([iconType, {iconData}]): SelectOption => ({
                value: iconType,
                content: iconType,
                data: {
                    iconNode: (
                        <Icon
                            className={b('ic-join-type')}
                            data={iconData}
                            width={42}
                            height={24}
                        />
                    ),
                },
            }),
        );
};

const getConditionItems = (): SelectOption[] => {
    return Object.values(BINARY_JOIN_OPERATORS)
        .filter((operator) => operator === BINARY_JOIN_OPERATORS.EQ)
        .map(
            (type): SelectOption => ({
                content: i18n(`value_binary-join-operator-${type}`),
                value: type,
            }),
        );
};
const validateAddingCondition = (leftSource: DatasetSource, rightSource: DatasetSource) => {
    const {raw_schema: leftItems} = leftSource;
    const {raw_schema: rightItems} = rightSource;

    return !(leftItems && rightItems);
};

const renderOptionWithIcon = (option: SelectOption) => {
    const iconNode = option.data?.iconNode;

    return (
        <div className={b('option')}>
            {iconNode && <span className={b('option-icon')}>{iconNode}</span>}
            <span>{option.content}</span>
        </div>
    );
};

const renderCustomControl = (
    args: SelectRenderControlProps,
    selectedValue: string,
    options: SelectOption[],
    renderOptions: {style?: React.CSSProperties; className?: string},
) => {
    const {ref, triggerProps} = args;
    const {onClick, onKeyDown} = triggerProps ?? {};
    const {style, className} = renderOptions;

    const selectedOption = options.find((o) => o.value === selectedValue);

    return (
        <Button
            style={style}
            view="outlined"
            className={className}
            ref={ref}
            onClick={onClick}
            onKeyDown={onKeyDown}
        >
            {selectedOption?.data?.iconNode || selectedOption?.content}
        </Button>
    );
};

type FieldSelectProps = {
    value: string | null;
    items: DatasetRawSchema[];
    onChange: (value: string) => void;
};

function FieldSelect(props: FieldSelectProps) {
    const {value, items, onChange} = props;

    const selectedValue = value ? [value] : undefined;

    return (
        <Select
            width="max"
            options={getFieldItems(items)}
            value={selectedValue}
            onUpdate={(v) => onChange(v[0])}
            renderOption={renderOptionWithIcon}
            renderSelectedOption={renderOptionWithIcon}
        />
    );
}

type ConditionSelectProps = {
    value: string;
    onChange: (value: string) => void;
};

function ConditionSelect(props: ConditionSelectProps) {
    const {value, onChange} = props;

    const selectedValue = [value];
    const options = getConditionItems();

    return (
        <Select
            options={options}
            value={selectedValue}
            onUpdate={(v) => onChange(v[0])}
            renderControl={(args) =>
                renderCustomControl(args, value, options, {
                    style: {width: 48},
                    className: b('select-type'),
                })
            }
        />
    );
}

type DeleteConditionButtonProps = {
    conditionIndex: number;
    deleteEnabled: boolean;
    onClick: (args: {conditionIndex: number}) => void;
};

function DeleteConditionButton(props: DeleteConditionButtonProps) {
    const {conditionIndex, deleteEnabled, onClick} = props;

    return (
        <Button
            className={b('btn-delete-condition', {disabled: !deleteEnabled})}
            view="flat"
            onClick={() => onClick({conditionIndex})}
        >
            <Icon className={b('ic-cross')} data={iconCross} width={18} height={18} />
        </Button>
    );
}

type ConditionChange = {
    operator?: string;
    right?: {source: string};
    left?: {source: string};
};

type JoinConditionProps = {
    deleteEnabled: boolean;
    conditionIndex: number;
    condition?: DatasetAvatarRelationCondition;
    leftSource?: DatasetSource;
    rightSource?: DatasetSource;
    onChange: (conditionIndex: number, condition: ConditionChange) => void;
    onClickDeleteCondition: (args: {conditionIndex: number}) => void;
};

function JoinCondition(props: JoinConditionProps) {
    const {
        deleteEnabled,
        conditionIndex,
        condition: {
            operator,
            left: {source: leftConditionSource} = {source: null},
            right: {source: rightConditionSource} = {source: null},
        } = {},
        leftSource: {raw_schema: leftItems = []} = {},
        rightSource: {raw_schema: rightItems = []} = {},
        onChange,
        onClickDeleteCondition,
    } = props;

    const onChangeCondition = (data: ConditionChange) => onChange(conditionIndex, data);
    const leftItemsSorted = [...leftItems].sort(sortByTile);
    const rightItemsSorted = [...rightItems].sort(sortByTile);

    return (
        <div className={b('join-condition')}>
            <FieldSelect
                value={leftConditionSource}
                items={leftItemsSorted}
                onChange={(source) => onChangeCondition({left: {source}})}
            />
            <ConditionSelect
                value={operator}
                onChange={(value) => onChangeCondition({operator: value})}
            />
            <FieldSelect
                value={rightConditionSource}
                items={rightItemsSorted}
                onChange={(source) => onChangeCondition({right: {source}})}
            />
            <DeleteConditionButton
                deleteEnabled={deleteEnabled}
                conditionIndex={conditionIndex}
                onClick={onClickDeleteCondition}
            />
        </div>
    );
}

type JoinSelectProps = {
    valid?: boolean;
    value: string;
    joinTypes: string[];
    onChange: (value: string) => void;
};

function JoinSelect(props: JoinSelectProps) {
    const {valid, value, joinTypes, onChange} = props;

    const selectedValue = [value];
    const options = getJoinTypeItems(joinTypes);

    return (
        <Select
            options={options}
            value={selectedValue}
            renderOption={renderOptionWithIcon}
            onUpdate={(v) => onChange(v[0])}
            renderControl={(args) =>
                renderCustomControl(args, value, options, {
                    className: b('select-join-type', {valid}),
                    style: {width: 48},
                })
            }
        />
    );
}

type DividerProps = {
    width?: number;
    valid?: boolean;
};

function Divider(props: DividerProps) {
    const {width, valid} = props;
    const style: React.CSSProperties = {};

    if (width) {
        style.flex = `0 0 ${width}px`;
    }

    return <div className={b('divider', {invalid: !valid})} style={style} />;
}

type LeftSourceProps = {
    valid?: boolean;
    leftAvatar: DatasetSourceAvatar;
};

function LeftSource(props: LeftSourceProps) {
    const {valid, leftAvatar: {title} = {}} = props;

    return (
        <div className={b('left-source')}>
            <Icon className={b('icon-table')} data={iconTable} width={14} height={14} />
            <div className={b('avatar-name')}>
                <span className={b('text-avatar-name')} title={title}>
                    {title}
                </span>
            </div>
            <Divider valid={valid} />
        </div>
    );
}

type RightSourceProps = {
    valid?: boolean;
    rightAvatar: DatasetSourceAvatar;
};

function RightSource(props: RightSourceProps) {
    const {valid, rightAvatar: {title} = {}} = props;

    return (
        <div className={b('right-source')}>
            <Divider valid={valid} width={18} />
            <Icon className={b('icon-table')} data={iconTable} width={14} height={14} />
            <div className={b('avatar-name')}>
                <span className={b('text-avatar-name')} title={title}>
                    {title}
                </span>
            </div>
        </div>
    );
}

type Props = {
    onClose: () => void;
    onSave: (args?: {relation: DatasetAvatarRelation}) => void;
    avatars: DatasetSourceAvatar[];
    sources: DatasetSource[];
    options: DatasetOptions;
    visible: boolean;
    valid?: boolean;
    relation: DatasetAvatarRelation;
};

type State = {
    relation: DatasetAvatarRelation;
    valid?: boolean;
    visible?: boolean;
    conditions: DatasetAvatarRelation['conditions'];
};

class SourceRelationDialog extends React.Component<Props, State> {
    static defaultProps = {
        visible: false,
        avatars: [],
        sources: [],
    };

    constructor(props: Props) {
        super(props);

        const {relation, valid, visible} = this.props;

        this.state = {
            relation,
            valid,
            visible,
            conditions: [],
        };
    }

    getAvatarById = (avatarId: string) => {
        const {avatars} = this.props;

        return avatars.find(({id}) => id === avatarId)!;
    };

    getSourceById = (sourceId: string) => {
        const {sources} = this.props;

        return sources.find(({id}) => id === sourceId)!;
    };

    get joinTypes() {
        const {options} = this.props;

        return _get(options, ['join', 'types']) || Object.values(JOIN_TYPES);
    }

    get joinType() {
        const {relation} = this.state;

        if (relation) {
            const {join_type: joinType} = relation;

            return joinType;
        }

        return undefined;
    }

    get leftSource() {
        const {relation} = this.state;

        if (relation) {
            const {left_avatar_id: leftAvatarId} = relation;

            const {source_id: sourceId} = this.getAvatarById(leftAvatarId);

            return this.getSourceById(sourceId);
        }

        return undefined;
    }

    get rightSource() {
        const {relation} = this.state;

        if (relation) {
            const {right_avatar_id: rightAvatarId} = relation;

            const {source_id: sourceId} = this.getAvatarById(rightAvatarId);

            return this.getSourceById(sourceId);
        }

        return undefined;
    }

    get leftAvatar() {
        const {relation} = this.state;

        if (relation) {
            const {left_avatar_id: leftAvatarId} = relation;

            return this.getAvatarById(leftAvatarId);
        }

        return undefined;
    }

    get rightAvatar() {
        const {relation} = this.state;

        if (relation) {
            const {right_avatar_id: rightAvatarId} = relation;

            return this.getAvatarById(rightAvatarId);
        }

        return undefined;
    }

    get conditions() {
        const {relation} = this.state;

        return (relation && relation.conditions) || [];
    }

    get isApplyBtnDisabled() {
        const {relation} = this.state;
        let isDisabled = true;

        if (relation) {
            const {conditions} = relation;

            isDisabled = conditions.some((condition) => {
                const {
                    operator,
                    left: {source: leftConditionSource} = {},
                    right: {source: rightConditionSource} = {},
                } = condition;

                return !(leftConditionSource && operator && rightConditionSource);
            });
        }

        return isDisabled;
    }

    get isOptimized() {
        const {relation} = this.state;

        return !relation.required;
    }

    changeJoinType = (type: string) => {
        this.setState({
            relation: {
                ...this.state.relation,
                join_type: type,
            },
        });
    };

    changeJoinCondition = (conditionIndex: number, condition: ConditionChange) => {
        const {relation} = this.state;
        const {conditions} = relation;

        const updatedCondition = conditions[conditionIndex];
        const nextCondition = _merge({}, updatedCondition, condition);

        const conditionsNext = [...conditions];

        conditionsNext.splice(conditionIndex, 1, nextCondition);

        this.setState({
            relation: {
                ...relation,
                conditions: conditionsNext,
            },
        });
    };

    addCondition = () => {
        const {relation} = this.state;
        const {conditions} = relation;

        const newCondition = {
            type: CONDITION_TYPES.BINARY,
            operator: BINARY_JOIN_OPERATORS.EQ,
            left: {
                calc_mode: CONDITION_FIELD_TYPES.DIRECT,
                source: null,
            },
            right: {
                calc_mode: CONDITION_FIELD_TYPES.DIRECT,
                source: null,
            },
        };

        this.setState({
            relation: {
                ...relation,
                conditions: [...conditions, newCondition],
            },
        });
    };

    deleteCondition = ({conditionIndex}: {conditionIndex: number}) => {
        const {relation} = this.state;
        const {conditions} = relation;

        const conditionsNext = [...conditions];
        conditionsNext.splice(conditionIndex, 1);

        this.setState({
            relation: {
                ...relation,
                conditions: conditionsNext,
            },
        });
    };

    changeOptimized = (optimized: boolean) => {
        const {relation} = this.state;

        this.setState({
            relation: {
                ...relation,
                required: !optimized,
            },
        });
    };

    modifyRelation = () => {
        const {onSave} = this.props;
        const {relation} = this.state;

        onSave({relation});
    };

    render() {
        const {onClose} = this.props;
        const {visible, valid} = this.state;

        return (
            <Dialog open={Boolean(visible)} onClose={onClose}>
                <Dialog.Header
                    caption={
                        <span data-qa={DatasetDialogRelationQA.DialogTitle}>
                            {i18n('label_source-relation')}
                        </span>
                    }
                />
                <Dialog.Body>
                    {visible && (
                        <div className={b()}>
                            <div className={b('join-type')}>
                                <LeftSource valid={valid} leftAvatar={this.leftAvatar!} />
                                <JoinSelect
                                    valid={valid}
                                    value={this.joinType}
                                    joinTypes={this.joinTypes}
                                    onChange={this.changeJoinType}
                                />
                                <RightSource valid={valid} rightAvatar={this.rightAvatar!} />
                            </div>
                            <div className={b('join-conditions')}>
                                {this.conditions.map((condition, conditionIndex) => (
                                    <JoinCondition
                                        key={`condition-${conditionIndex}`}
                                        deleteEnabled={this.conditions.length > 1}
                                        leftSource={this.leftSource}
                                        rightSource={this.rightSource}
                                        conditionIndex={conditionIndex}
                                        condition={condition}
                                        onClickDeleteCondition={this.deleteCondition}
                                        onChange={this.changeJoinCondition}
                                    />
                                ))}
                            </div>
                            <Button
                                qa={DatasetDialogRelationQA.AddRelation}
                                className={b('btn-add-condition')}
                                width="auto"
                                disabled={validateAddingCondition(
                                    this.leftSource!,
                                    this.rightSource!,
                                )}
                                onClick={this.addCondition}
                            >
                                {i18n('button_add-condition')}
                            </Button>

                            <div className={b('optimize-join')}>
                                <Checkbox
                                    checked={this.isOptimized}
                                    onUpdate={this.changeOptimized}
                                >
                                    {i18n('label_optimize-join')}
                                    <HelpMark className={b('hint-optimize-join')}>
                                        {i18n('hint_optimize-join')}
                                    </HelpMark>
                                </Checkbox>
                            </div>
                        </div>
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    preset="default"
                    onClickButtonCancel={onClose}
                    onClickButtonApply={this.modifyRelation}
                    propsButtonApply={{
                        disabled: this.isApplyBtnDisabled,
                        qa: DatasetDialogRelationQA.Apply,
                    }}
                    textButtonCancel={i18n('button_cancel')}
                    textButtonApply={i18n('button_apply')}
                />
            </Dialog>
        );
    }
}

JoinSelect.defaultProps = {
    value: '',
};

ConditionSelect.defaultProps = {
    value: '',
};

FieldSelect.defaultProps = {
    items: [],
    value: '',
};

export default withHiddenUnmount(SourceRelationDialog);
