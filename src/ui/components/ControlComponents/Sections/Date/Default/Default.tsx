import React from 'react';

import {Button, RadioGroup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import moment from 'moment';
import type {FilterValue} from 'shared';
import {
    ControlQA,
    DATASET_FIELD_TYPES,
    DialogControlDateQa,
    getParsedIntervalDates,
    getParsedRelativeDate,
} from 'shared';
import {RelativeDatesPicker} from 'ui';

import {
    DATETIME_FORMAT,
    DATE_FORMAT,
} from '../../../../../units/dash/containers/Dialogs/Control/constants';
import Dialog from '../../../Dialog/Dialog';

import './Default.scss';

const enum DefaultDateType {
    defined = 'defined',
    notDefined = 'notDefined',
}

function getTextForRelativeDate(dateString: string, withTime: boolean) {
    if (dateString.indexOf('__relative_') === 0) {
        const [sign, count, scale] = getParsedRelativeDate(dateString)!;
        const unit = i18n('component.relative-dates-picker.view', `label_scale-${scale}`, {
            count,
        }).toLocaleLowerCase();

        const direction =
            sign === '-'
                ? i18n('dash.control-dialog.edit', 'value_date-ago')
                : i18n('dash.control-dialog.edit', 'value_date-forward');

        return `${count} ${unit} ${direction}`;
    } else {
        return moment.utc(dateString).format(withTime ? DATETIME_FORMAT : DATE_FORMAT);
    }
}

const radioButtonItems = [
    {
        value: DefaultDateType.notDefined,
        text: i18n('dash.control-dialog.edit', 'value_undefined'),
        qa: DialogControlDateQa.defaultNotDefined,
    },
    {
        value: DefaultDateType.defined,
        text: i18n('dash.control-dialog.edit', 'value_date-manual'),
        qa: DialogControlDateQa.defaultSelectValue,
    },
];

const b = block('date-manual-default-value');

const mixRadioBox = b('radiobox');

// TODO: switch to interval/relative

// for relative parameters , the logic is as follows:
// the value of the form __interval___relative_-5d___relative_ 1d means from today -5 days to today 1 day
// but in the interface, the fields are called "Days ago",
// that is, a positive number 3 in the field means -3 days from today, and a negative -3 means today - 3 days, i.e. 3
// therefore, you need to change and accordingly - when getting the value from the props and when saving the value

interface Props {
    acceptableValues: Record<string, any>;
    defaultValue: FilterValue;
    isRange: boolean;
    onApply: (payload: {defaultValue: FilterValue}) => void;
    fieldType?: DATASET_FIELD_TYPES;
    withTime?: boolean;
    disabled?: boolean;
    hasValidationError: boolean;
}

interface State {
    showDialog: boolean;
    isInvalid: boolean;
    isRange: boolean;
    defaultValue: FilterValue;
    type: string;
}

class Default extends React.PureComponent<Props, State> {
    static defaultProps = {
        acceptableValues: {},
    };

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        const updatedState: Partial<State> = {isRange: Boolean(nextProps.isRange)};

        if (!prevState.showDialog) {
            updatedState.defaultValue = nextProps.defaultValue;
            updatedState.type = nextProps.defaultValue
                ? DefaultDateType.defined
                : DefaultDateType.notDefined;
        } else if (nextProps.isRange !== prevState.isRange) {
            updatedState.defaultValue = undefined;
        }

        return updatedState;
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            showDialog: false,
            isInvalid: false,
            isRange: Boolean(props.isRange),
            defaultValue: props.defaultValue,
            type: props.defaultValue ? DefaultDateType.defined : DefaultDateType.notDefined,
        };
    }

    closeDialog = () => {
        this.setState({showDialog: false});
    };

    getText() {
        const {defaultValue, isRange} = this.state;

        if (!defaultValue) {
            return i18n('dash.control-dialog.edit', 'value_undefined');
        }

        const withTime = this.getWithTime();

        if (isRange) {
            const parsedDates = getParsedIntervalDates(defaultValue)!;

            const from = getTextForRelativeDate(parsedDates[0], withTime);
            const to = getTextForRelativeDate(parsedDates[1], withTime);

            return i18n('dash.control-dialog.edit', 'value_date-days-ago-from-to', {from, to});
        } else if (defaultValue.indexOf('__relative_') === 0) {
            return getTextForRelativeDate(defaultValue, withTime);
        } else {
            return moment.utc(defaultValue).format(withTime ? DATETIME_FORMAT : DATE_FORMAT);
        }
    }

    onChangeRelative = (value: string, {valid}: {valid: boolean}) => {
        this.setState({defaultValue: value, isInvalid: !valid});
    };

    onEnter = () => {
        const {type, defaultValue} = this.state;
        const isDefined = type === DefaultDateType.defined;

        this.props.onApply({defaultValue: isDefined ? defaultValue : undefined});

        if (!isDefined) {
            this.setState({defaultValue: undefined});
        }

        this.closeDialog();
    };

    onChangeRadioBox = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            type: event.target.value,
        });
    };

    renderContent() {
        const {type, defaultValue, isRange} = this.state;

        const withTime = this.getWithTime();

        return radioButtonItems.map((item) => (
            <React.Fragment key={item.value}>
                <div className={b('radiobox-place')}>
                    <RadioGroup
                        size="m"
                        name={item.text}
                        value={type}
                        onChange={this.onChangeRadioBox}
                        className={mixRadioBox}
                        qa={item.qa}
                    >
                        <RadioGroup.Option value={item.value}>{item.text}</RadioGroup.Option>
                    </RadioGroup>
                </div>
                <div className={b('radiobox-content')}>
                    {item.value === DefaultDateType.defined && item.value === type && (
                        <div className={b('input-single-place')}>
                            <RelativeDatesPicker
                                range={Boolean(isRange)}
                                value={defaultValue}
                                withTime={withTime}
                                onChange={this.onChangeRelative}
                            />
                        </div>
                    )}
                </div>
            </React.Fragment>
        ));
    }

    renderDialog() {
        const {showDialog, isInvalid} = this.state;
        return (
            <Dialog
                visible={showDialog}
                caption={i18n('dash.control-dialog.edit', 'label_default-value')}
                onApply={this.onEnter}
                onClose={this.closeDialog}
                disabled={isInvalid}
            >
                {this.renderContent()}
            </Dialog>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Button
                    onClick={() => this.setState({showDialog: !this.state.showDialog})}
                    disabled={this.props.disabled}
                    className={b('default-btn', {error: this.props.hasValidationError})}
                    view="outlined"
                    width="max"
                    qa={ControlQA.acceptableDialogButton}
                >
                    {this.getText()}
                </Button>
                {this.renderDialog()}
            </React.Fragment>
        );
    }

    private getWithTime() {
        const {fieldType, withTime} = this.props;

        return Boolean(
            (fieldType && fieldType === DATASET_FIELD_TYPES.GENERICDATETIME) || withTime,
        );
    }
}

export default Default;
