import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';
import {i18n} from 'i18n';

import {CHART_SETTINGS} from '../../../../constants';
import SettingSwitcher from '../SettingSwitcher/SettingSwitcher';

type PaginationProps = {
    paginationValue: string;
    disabled: boolean;
    onChange: (value: string) => void;
    tooltip: boolean;
    tooltipText: string;
    tooltipClassName?: string;
    tooltipPosition?: PopupPlacement;
    isTreeInTable?: boolean;
};

type PaginationSettingProps = Omit<
    PaginationProps,
    'disabled' | 'tooltip' | 'tooltipText' | 'tooltipPosition'
> & {
    datasetsCount: number;
};

const PaginationSwitcher: React.FC<PaginationProps> = (props: PaginationProps) => {
    const {paginationValue, disabled, tooltip, tooltipPosition, tooltipText, tooltipClassName} =
        props;

    const title = i18n('wizard', 'label_pagination');

    const currentValue = disabled ? CHART_SETTINGS.PAGINATION.OFF : paginationValue;

    return (
        <SettingSwitcher
            currentValue={currentValue}
            checkedValue={CHART_SETTINGS.PAGINATION.ON}
            uncheckedValue={CHART_SETTINGS.PAGINATION.OFF}
            onChange={props.onChange}
            title={title}
            disabled={disabled}
            qa="pagination-switcher"
            tooltip={tooltip}
            tooltipText={tooltipText}
            tooltipClassName={tooltipClassName}
            tooltipPosition={tooltipPosition}
        />
    );
};

const SettingPagination: React.FC<PaginationSettingProps> = (props: PaginationSettingProps) => {
    const {paginationValue, datasetsCount, onChange, tooltipClassName, isTreeInTable} = props;

    let isPaginationUnavailable = false;
    let tooltipText = '';

    if (datasetsCount > 1) {
        isPaginationUnavailable = true;
        tooltipText = i18n('wizard', 'tooltip_pagination_unavailable');
    }

    if (isTreeInTable) {
        isPaginationUnavailable = true;
        tooltipText = i18n('wizard', 'tooltip_tree-pagination_unavailable');
    }

    const handleSwitcherChange = React.useCallback((value: string) => onChange(value), [onChange]);

    if (!paginationValue) {
        return null;
    }

    return (
        <PaginationSwitcher
            paginationValue={paginationValue}
            onChange={handleSwitcherChange}
            disabled={isPaginationUnavailable}
            tooltip={isPaginationUnavailable}
            tooltipText={tooltipText}
            tooltipClassName={tooltipClassName}
            tooltipPosition={['right']}
        />
    );
};

export default SettingPagination;
