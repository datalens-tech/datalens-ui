import React from 'react';

import {Button, Checkbox, Dialog, TextArea, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {ControlQA, TitlePlacementOption, resolveIntervalDate, resolveRelativeDate} from 'shared';
import {DL} from 'ui/constants/common';
import {registry} from 'ui/registry';
import {CheckboxControlValue} from 'ui/units/dash/containers/Dialogs/Control/constants';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import {YCSelect} from '../../../../../components/common/YCSelect/YCSelect';
import {wrapToArray} from '../../../helpers/helpers';

import withWrapForControls from './withWrapForControls';

import './Items.scss';

const DatepickerControl = registry.common.components.get('DatepickerControl', {wrap: true});

const b = block('chartkit-control-item');

const legoThemeNameMapper = {
    light: 'flat-secondary',
    pseudo: 'outlined',
    link: 'outlined-info',
    accent: 'action',
    websearch: 'action',
    'flat-special': 'flat-contrast',
    'normal-special': 'normal-contrast',
    'pseudo-special': 'outlined-contrast',
};

const tryResolveRelativeDate = (value, intervalPart) => {
    try {
        return resolveRelativeDate(value, intervalPart);
    } catch (e) {
        return false;
    }
};

const tryResolveIntervalDate = (value) => {
    try {
        return resolveIntervalDate(value);
    } catch (e) {
        return false;
    }
};

const controlSize = DL.IS_MOBILE ? MOBILE_SIZE.CONTROL : 'm';
const controlWidth = DL.IS_MOBILE ? '100%' : undefined;

function BaseControlSelect({
    searchable = true,
    multiselect,
    content,
    value,
    onChange,
    getItems,
    label,
    labelInside,
    innerLabel,
    errorContent,
    loadingItems,
    itemsLoaderClassName,
    onOpenChange,
    placeholder,
    required,
    hasValidationError,
    limitLabel,
    disabled,
}) {
    const [currentValue, setCurrentValue] = React.useState(
        multiselect ? wrapToArray(value) : value,
    );

    React.useEffect(() => {
        setCurrentValue(multiselect ? wrapToArray(value) : value);
    }, [value, multiselect]);

    const items = content
        // because the choice of such values leads to incorrect behavior
        .filter(({value}) => value !== null && value !== '' && value !== undefined)
        .map(({title, value}) => ({
            value,
            title,
            key: value,
        }));

    const wrappedOnChange = React.useCallback(
        (value) => {
            // null - when SINGLE with allowEmptyValue and there is no selected value, otherwise [null] is obtained in the parameters
            // [] - when MULTIPLE and there is no selected value, otherwise results in the parameters []
            const wrappedValue =
                value === null || (Array.isArray(value) && !value.length) ? '' : value;

            setCurrentValue(multiselect ? wrapToArray(wrappedValue) : wrappedValue);
            return onChange(wrappedValue);
        },
        [onChange, multiselect],
    );

    const showSelectAll = currentValue?.length === items?.length && required ? false : undefined;

    const size = DL.IS_MOBILE ? MOBILE_SIZE.YC_SELECT : 's';

    return (
        <YCSelect
            showSearch={searchable}
            type={multiselect ? YCSelect.MULTIPLE : YCSelect.SINGLE}
            allowEmptyValue={!required}
            showMissingItems={true}
            value={currentValue}
            onUpdate={wrappedOnChange}
            controlTestAnchor={ControlQA.controlSelect}
            itemsListTestAnchor={ControlQA.controlSelectItems}
            items={getItems ? undefined : items}
            initialItems={getItems ? items : undefined}
            label={labelInside ? label : innerLabel}
            limitLabel={limitLabel}
            getItems={getItems}
            loadingItems={loadingItems}
            errorContent={errorContent}
            itemsLoaderClassName={itemsLoaderClassName}
            onOpenChange={onOpenChange}
            placeholder={placeholder}
            size={size}
            className={b('yc-select')}
            showSelectAll={showSelectAll}
            hasValidationError={hasValidationError}
            disabled={disabled}
        />
    );
}

BaseControlSelect.propTypes = {
    label: PropTypes.string,
    param: PropTypes.string.isRequired,
    multiselect: PropTypes.bool,
    searchable: PropTypes.bool,
    content: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    ).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    onChange: PropTypes.func.isRequired,
    getItems: PropTypes.func,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hidden: PropTypes.bool,
    labelInside: PropTypes.bool,
    innerLabel: PropTypes.string,
    loadingItems: PropTypes.bool,
    errorContent: PropTypes.node,
    itemsLoaderClassName: PropTypes.string,
    onOpenChange: PropTypes.func,
    placeholder: PropTypes.string,
    widgetId: PropTypes.string,
    required: PropTypes.bool,
    hasValidationError: PropTypes.bool,
    limitLabel: PropTypes.bool,
    disabled: PropTypes.bool,
};

function BaseControlInput({
    placeholder,
    value,
    onChange,
    innerLabel,
    labelInside,
    label,
    hasValidationError,
    disabled,
}) {
    const [text, setText] = React.useState(value || '');

    React.useEffect(() => setText(value), [value]);

    const isInvalid = hasValidationError && !text?.length;

    return (
        <TextInput
            placeholder={placeholder}
            className={b('component', {input: true})}
            value={text}
            onUpdate={(value) => setText(value)}
            onKeyPress={(event) => event.charCode === 13 && onChange(text)}
            onBlur={() => {
                // For case: input has `updateOnChange: true`, there is button control with `setInitialParams`.
                // Need setTimeout for common microtask queue: firstly fire onBlur (from Input), then onClick (from Button)
                // Before fix: in some cases onClick form Button didn't fire at all (or just didn't work, next work)
                // (Possible reasons: because of rerendering after onChange form Input).
                setTimeout(() => {
                    onChange(text);
                });
            }}
            label={labelInside ? label : innerLabel}
            qa={ControlQA.controlInput}
            // triggered twice, so controlAttrs.onKeyPress is used
            // corrected in lor 3.2.0 ISL-5502
            // onKeyDown={event => event.keyCode === 13 && props.onEnter(text)}
            size={controlSize}
            error={isInvalid}
            disabled={disabled}
        />
    );
}

BaseControlInput.propTypes = {
    label: PropTypes.string,
    param: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hidden: PropTypes.bool,
    innerLabel: PropTypes.string,
    labelInside: PropTypes.bool,
    widgetId: PropTypes.string,
    required: PropTypes.bool,
    hasValidationError: PropTypes.bool,
    disabled: PropTypes.bool,
};

function BaseControlTextArea({label, theme, value, placeholder, onChange}) {
    const [text, setText] = React.useState(value);
    const [showModal, setShowModal] = React.useState(false);
    const handleClose = React.useCallback(() => {
        if (text === value) {
            setShowModal(false);
        } else if (confirm(i18n('chartkit.control.items', 'close-confirm'))) {
            setShowModal(false);
            setText(value);
        }
    }, [value, text]);

    const handleClick = () => {
        setShowModal(true);
    };

    const buttonTheme = theme in legoThemeNameMapper ? legoThemeNameMapper[theme] : theme;
    const buttonSize = DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : 's';

    return (
        <React.Fragment>
            <Button
                view={buttonTheme || 'normal'}
                size={buttonSize}
                width="max"
                onClick={handleClick}
            >
                {label}
            </Button>
            {showModal && (
                <Dialog open={showModal} onClose={handleClose}>
                    <Dialog.Header caption={label} />
                    <Dialog.Body>
                        <TextArea
                            value={text}
                            placeholder={placeholder}
                            className={b('textarea')}
                            controlProps={{
                                style: {
                                    resize: 'both',
                                    minWidth: 480,
                                    minHeight: 28,
                                },
                            }}
                            onUpdate={(value) => setText(value)}
                            size={controlSize}
                        />
                    </Dialog.Body>
                    <Dialog.Footer
                        textButtonApply={i18n('chartkit.control.items', 'apply')}
                        onClickButtonApply={() => {
                            setShowModal(false);
                            onChange(text);
                        }}
                        textButtonCancel={i18n('chartkit.control.items', 'close')}
                        onClickButtonCancel={handleClose}
                    />
                </Dialog>
            )}
        </React.Fragment>
    );
}

BaseControlTextArea.propTypes = {
    label: PropTypes.string,
    param: PropTypes.string.isRequired,
    theme: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hidden: PropTypes.bool,
    widgetId: PropTypes.string,
};

function BaseControlDatepicker({
    minDate,
    maxDate,
    format,
    timeFormat,
    value,
    onChange,
    widgetId = '',
    required,
    hasValidationError,
    innerLabel,
    labelInside,
    label,
    labelPlacement,
    disabled,
}) {
    const date = (value && tryResolveRelativeDate(value)) || value;

    const wrappedOnChange = React.useCallback(
        ({from}) => onChange(from === null ? '' : from),
        [onChange],
    );

    const vertical = labelPlacement === TitlePlacementOption.Top;

    return (
        <DatepickerControl
            widgetId={widgetId}
            min={minDate}
            max={maxDate}
            from={date}
            format={format || `dd.MM.yyyy ${timeFormat || ''}`.trim()}
            scale="day"
            timezoneOffset={0}
            range={false}
            hasClear={!required}
            showApply={false}
            allowNullableValues={true}
            emptyValueText={i18n('chartkit.control.items', 'value_undefined')}
            onUpdate={wrappedOnChange}
            controlSize={controlSize}
            controlWidth={controlWidth}
            className={b('component', {vertical})}
            hasValidationError={hasValidationError}
            required={required}
            label={labelInside ? label : innerLabel}
            disabled={disabled}
        />
    );
}

BaseControlDatepicker.propTypes = {
    label: PropTypes.string,
    param: PropTypes.string.isRequired,
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
    format: PropTypes.string,
    timeFormat: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hidden: PropTypes.bool,
    widgetId: PropTypes.string,
    required: PropTypes.bool,
    hasValidationError: PropTypes.bool,
    innerLabel: PropTypes.string,
    labelInside: PropTypes.bool,
    labelPlacement: PropTypes.string,
    disabled: PropTypes.bool,
};

function BaseControlRangeDatepicker({
    minDate,
    maxDate,
    format,
    timeFormat,
    value,
    returnInterval,
    onChange,
    widgetId = '',
    required,
    hasValidationError,
    innerLabel,
    labelInside,
    label,
    labelPlacement,
    disabled,
}) {
    let from;
    let to;

    if (value) {
        if (typeof value === 'object') {
            from = (value.from && tryResolveRelativeDate(value.from, 'start')) || value.from;
            to = (value.to && tryResolveRelativeDate(value.to, 'end')) || value.to;
        } else {
            const resolved = value && tryResolveIntervalDate(value);

            if (resolved) {
                from = resolved.from;
                to = resolved.to;
            }
        }
    }

    const wrappedOnChange = React.useCallback(
        ({from, to}) => {
            const resultFrom = from === null ? '' : from;
            const resultTo = to === null ? '' : to;

            let result;

            if (returnInterval) {
                result = resultFrom && resultTo ? `__interval_${resultFrom}_${resultTo}` : '';
            } else {
                result = {from: resultFrom, to: resultTo};
            }

            onChange(result);
        },
        [returnInterval, onChange],
    );

    const vertical = labelPlacement === TitlePlacementOption.Top;

    return (
        <DatepickerControl
            widgetId={widgetId}
            min={minDate}
            max={maxDate}
            from={from}
            to={to}
            format={format || `dd.MM.yyyy ${timeFormat || ''}`.trim()}
            timezoneOffset={0}
            hasClear={!required}
            showApply={false}
            allowNullableValues={true}
            emptyValueText={i18n('chartkit.control.items', 'value_undefined')}
            onUpdate={wrappedOnChange}
            controlSize={controlSize}
            controlWidth={controlWidth}
            className={b('component', {vertical})}
            hasValidationError={hasValidationError}
            required={required}
            fillPartialInterval={true}
            label={labelInside ? label : innerLabel}
            disabled={disabled}
        />
    );
}

BaseControlRangeDatepicker.propTypes = {
    label: PropTypes.string,
    param: PropTypes.string, // for the case __interval_YYYY-MM-DD_YYYY-MM-DD
    paramFrom: PropTypes.string,
    paramTo: PropTypes.string,
    format: PropTypes.string,
    timeFormat: PropTypes.string,
    returnInterval: PropTypes.bool,
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.shape({
            from: PropTypes.string,
            to: PropTypes.string,
        }),
        PropTypes.string,
    ]),
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hidden: PropTypes.bool,
    widgetId: PropTypes.string,
    required: PropTypes.bool,
    hasValidationError: PropTypes.bool,
    innerLabel: PropTypes.string,
    labelInside: PropTypes.bool,
    labelPlacement: PropTypes.string,
    disabled: PropTypes.bool,
};

function BaseControlButton({label, theme, onChange, qa, disabled}) {
    const buttonTheme = theme in legoThemeNameMapper ? legoThemeNameMapper[theme] : theme;

    const size = DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : 's';

    const handleClick = () => {
        setTimeout(onChange);
    };

    return (
        <Button
            view={buttonTheme || 'normal'}
            size={size}
            width="max"
            // Need setTimeout for common microtask queue: firstly fire onBlur (from Input), then onClick (from Button)
            onClick={handleClick}
            disabled={disabled}
            qa={qa}
        >
            {label || i18n('chartkit.control.items', 'apply')}
        </Button>
    );
}

BaseControlButton.propTypes = {
    label: PropTypes.string,
    theme: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    qa: PropTypes.string,
};

function BaseControlCheckbox({label, value, onChange, disabled}) {
    const checked = value === CheckboxControlValue.TRUE;

    const size = DL.IS_MOBILE ? MOBILE_SIZE.CHECKBOX : 'm';

    return (
        <Checkbox
            theme="normal"
            view="default"
            size={size}
            checked={checked}
            title={label}
            onChange={() =>
                onChange(checked ? CheckboxControlValue.FALSE : CheckboxControlValue.TRUE)
            }
            disabled={disabled}
        >
            {label}
        </Checkbox>
    );
}

BaseControlCheckbox.propTypes = {
    label: PropTypes.string,
    param: PropTypes.string.isRequired,
    dateFormat: PropTypes.string,
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hidden: PropTypes.bool,
    widgetId: PropTypes.string,
    disabled: PropTypes.bool,
};

const ControlInput = withWrapForControls(BaseControlInput);
const ControlTextArea = withWrapForControls(BaseControlTextArea);
const ControlSelect = withWrapForControls(BaseControlSelect);
const ControlButton = withWrapForControls(BaseControlButton);
const ControlCheckbox = withWrapForControls(BaseControlCheckbox);
const ControlDatepicker = withWrapForControls(BaseControlDatepicker);
const ControlRangeDatepicker = withWrapForControls(BaseControlRangeDatepicker);

export {
    ControlInput,
    ControlTextArea,
    ControlSelect,
    ControlButton,
    ControlCheckbox,
    ControlDatepicker,
    ControlRangeDatepicker,
};
