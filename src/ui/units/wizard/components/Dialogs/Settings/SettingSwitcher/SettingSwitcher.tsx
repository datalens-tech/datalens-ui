import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';
import {Popover, Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './SettingSwitcher.scss';

type CommonProps = {
    currentValue: string;
    checkedValue: string;
    uncheckedValue: string;
    onChange: (value: string) => void;
    title: string;
    disabled?: boolean;
    qa?: string;
};

type PropsWithTooltip = {
    tooltip: true;
    tooltipText: string;
    tooltipPosition?: PopupPlacement;
    tooltipClassName?: string;
} & CommonProps;

type Props = (CommonProps & {tooltip?: false}) | PropsWithTooltip;

const b = block('setting-switcher');

type SettingSwitcherWithTooltipProps = React.PropsWithChildren<
    Pick<PropsWithTooltip, 'tooltipText' | 'tooltipPosition' | 'tooltipClassName'>
>;

const SettingSwitcherWithTooltip = (props: SettingSwitcherWithTooltipProps) => {
    return (
        <Popover
            content={props.tooltipText}
            className={props.tooltipClassName}
            placement={props.tooltipPosition}
        >
            {props.children as React.ReactElement}
        </Popover>
    );
};

const SettingSwitcherBase: React.FC<CommonProps> = (props: CommonProps) => {
    const {currentValue, checkedValue, uncheckedValue, title, onChange, qa, disabled} = props;

    const isChecked = currentValue === checkedValue;

    const handleSwitchUpdate = React.useCallback(
        (enabled: boolean) => {
            const value = enabled ? checkedValue : uncheckedValue;
            onChange(value);
        },
        [checkedValue, onChange, uncheckedValue],
    );

    return (
        <div className={b('container')}>
            <span className={b('label')}>{title}</span>
            <Switch checked={isChecked} onUpdate={handleSwitchUpdate} qa={qa} disabled={disabled} />
        </div>
    );
};

const SettingSwitcher: React.FC<Props> = (props: Props) => {
    const baseProps: CommonProps = {
        currentValue: props.currentValue,
        checkedValue: props.checkedValue,
        uncheckedValue: props.uncheckedValue,
        title: props.title,
        onChange: props.onChange,
        qa: props.qa,
        disabled: props.disabled,
    };

    if ('tooltip' in props && props.tooltip) {
        return (
            <SettingSwitcherWithTooltip
                tooltipText={props.tooltipText}
                tooltipPosition={props.tooltipPosition}
                tooltipClassName={props.tooltipClassName}
            >
                <SettingSwitcherBase {...baseProps} />
            </SettingSwitcherWithTooltip>
        );
    }

    return <SettingSwitcherBase {...baseProps} />;
};

export default SettingSwitcher;
